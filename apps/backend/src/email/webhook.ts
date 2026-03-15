/**
 * Postmark webhook handler with HMAC verification, replay protection, and delivery tracking.
 */

import type { PrismaClient } from "@prisma/client";

/** Maximum age in ms for a webhook timestamp to be considered fresh. */
const WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Verifies the HMAC-SHA256 signature of a webhook request body.
 * Uses Web Crypto API (available in Cloudflare Workers).
 *
 * @param rawBody - The raw request body as a string (NOT parsed JSON)
 * @param signature - The HMAC signature from the webhook header
 * @param secret - The webhook signing secret
 * @returns true if the signature is valid
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!signature || !secret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody),
  );

  const expectedSignature = bufferToHex(signatureBytes);
  return timingSafeEqual(expectedSignature, signature);
}

/** Convert an ArrayBuffer to a lowercase hex string. */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Both strings must be the same length for this to be meaningful.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validates that the webhook timestamp is within the acceptable freshness window.
 */
export function isTimestampFresh(
  timestamp: string | undefined,
  nowMs?: number,
): boolean {
  if (!timestamp) return false;
  const webhookTime = new Date(timestamp).getTime();
  if (Number.isNaN(webhookTime)) return false;
  const now = nowMs ?? Date.now();
  return Math.abs(now - webhookTime) <= WEBHOOK_MAX_AGE_MS;
}

/** Delivery status state machine. Defines valid transitions. */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["sending"],
  sending: ["sent", "failed"],
  sent: ["delivered", "bounced", "failed"],
  delivered: [],
  bounced: [],
  failed: [],
};

/** Check if a delivery status transition is valid. */
export function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Extended Postmark webhook event types (including engagement tracking). */
export type WebhookEventType = "Delivery" | "Bounce" | "SpamComplaint" | "Open" | "Click";

export interface WebhookPayload {
  RecordType: WebhookEventType;
  MessageID: string;
  DeliveredAt?: string;
  BouncedAt?: string;
  /** Postmark bounce type ID. Hard bounces have TypeCode >= 1. */
  TypeCode?: number;
  /** Bounce description */
  Description?: string;
  /** Email address */
  Email?: string;
  /** Timestamp from Postmark (for freshness check) */
  Metadata?: Record<string, string>;
}

export interface WebhookProcessResult {
  processed: boolean;
  reason?: string;
  /** Magic link ID for WebSocket push (only set when delivery status changes) */
  magicLinkId?: string;
  /** New delivery status (only set when delivery status changes) */
  newStatus?: string;
}

/**
 * Processes a verified Postmark webhook event.
 * - Deduplicates by MessageID
 * - Updates delivery status on MagicLink
 * - Creates EmailSuppression on hard bounce or spam complaint
 */
export async function processWebhookEvent(
  prisma: PrismaClient,
  payload: WebhookPayload,
): Promise<WebhookProcessResult> {
  const { RecordType, MessageID } = payload;

  if (!MessageID) {
    return { processed: false, reason: "missing_message_id" };
  }

  // Find the MagicLink by postmarkMessageId
  const magicLink = await prisma.magicLink.findFirst({
    where: { postmarkMessageId: MessageID },
  });

  if (!magicLink) {
    return { processed: false, reason: "magic_link_not_found" };
  }

  // SpamComplaint can arrive after delivery — must process suppression regardless
  // of delivery status. Only skip terminal-state dedup for Delivery/Bounce events.
  if (RecordType !== "SpamComplaint") {
    if (
      magicLink.deliveryStatus === "delivered" ||
      magicLink.deliveryStatus === "bounced"
    ) {
      return { processed: false, reason: "already_terminal" };
    }
  }

  switch (RecordType) {
    case "Delivery": {
      if (!isValidTransition(magicLink.deliveryStatus, "delivered")) {
        return { processed: false, reason: "invalid_transition" };
      }
      await prisma.magicLink.update({
        where: { id: magicLink.id },
        data: { deliveryStatus: "delivered" },
      });
      return { processed: true, magicLinkId: magicLink.id, newStatus: "delivered" };
    }

    case "Bounce": {
      if (!isValidTransition(magicLink.deliveryStatus, "bounced")) {
        return { processed: false, reason: "invalid_transition" };
      }
      await prisma.magicLink.update({
        where: { id: magicLink.id },
        data: { deliveryStatus: "bounced" },
      });

      // Hard bounce → add to suppression list
      const isHardBounce =
        payload.TypeCode !== undefined && payload.TypeCode >= 1;
      if (isHardBounce && payload.Email) {
        await prisma.emailSuppression.upsert({
          where: { email: payload.Email.toLowerCase().trim() },
          create: {
            email: payload.Email.toLowerCase().trim(),
            reason: "hard_bounce",
            details: JSON.stringify({
              typeCode: payload.TypeCode,
              description: payload.Description,
              messageId: MessageID,
            }),
          },
          update: {}, // Already suppressed, no update needed
        });
      }
      return { processed: true, magicLinkId: magicLink.id, newStatus: "bounced" };
    }

    case "SpamComplaint": {
      // Spam complaint → suppression (delivery status can stay as-is)
      if (payload.Email) {
        await prisma.emailSuppression.upsert({
          where: { email: payload.Email.toLowerCase().trim() },
          create: {
            email: payload.Email.toLowerCase().trim(),
            reason: "spam_complaint",
            details: JSON.stringify({
              messageId: MessageID,
            }),
          },
          update: {}, // Already suppressed
        });
      }
      return { processed: true };
    }

    default:
      return { processed: false, reason: "unknown_record_type" };
  }
}

/** Monotonic status order for announcement deliveries. */
const ANNOUNCEMENT_STATUS_ORDER: Record<string, number> = {
  queued: 0,
  sending: 1,
  sent: 2,
  delivered: 3,
  failed: 4,
  suppressed: 5,
};

export interface AnnouncementWebhookResult {
  processed: boolean;
  reason?: string;
  deliveryId?: string;
  newStatus?: string;
}

/**
 * Processes a Postmark webhook event for announcement deliveries.
 * Looks up delivery by externalMessageId (Postmark MessageID).
 * Records events in DeliveryEvent table with replay protection.
 * Updates AnnouncementDelivery status with monotonic progression.
 */
export async function processAnnouncementWebhookEvent(
  prisma: PrismaClient,
  payload: WebhookPayload,
): Promise<AnnouncementWebhookResult> {
  const { RecordType, MessageID } = payload;

  if (!MessageID) {
    return { processed: false, reason: "missing_message_id" };
  }

  // Find announcement delivery by externalMessageId
  const delivery = await prisma.announcementDelivery.findFirst({
    where: { externalMessageId: MessageID, channel: "email" },
  });

  if (!delivery) {
    return { processed: false, reason: "delivery_not_found" };
  }

  // Create delivery event with providerEventId for dedup
  const providerEventId = `postmark:${MessageID}:${RecordType}`;

  switch (RecordType) {
    case "Delivery": {
      const currentOrder = ANNOUNCEMENT_STATUS_ORDER[delivery.status] ?? -1;
      const newOrder = ANNOUNCEMENT_STATUS_ORDER["delivered"] ?? 99;
      if (newOrder <= currentOrder) {
        return { processed: false, reason: "status_not_progressing" };
      }

      try {
        await prisma.deliveryEvent.create({
          data: {
            deliveryId: delivery.id,
            eventType: "delivered",
            source: "postmark",
            providerEventId,
          },
        });
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
          return { processed: false, reason: "duplicate_event" };
        }
        throw err;
      }

      await prisma.announcementDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "delivered",
          deliveredAt: new Date(),
          lastEventAt: new Date(),
        },
      });
      return { processed: true, deliveryId: delivery.id, newStatus: "delivered" };
    }

    case "Bounce": {
      const currentOrder = ANNOUNCEMENT_STATUS_ORDER[delivery.status] ?? -1;
      const newOrder = ANNOUNCEMENT_STATUS_ORDER["failed"] ?? 99;
      if (newOrder <= currentOrder) {
        return { processed: false, reason: "status_not_progressing" };
      }

      const isHardBounce = payload.TypeCode !== undefined && payload.TypeCode >= 1;

      try {
        await prisma.deliveryEvent.create({
          data: {
            deliveryId: delivery.id,
            eventType: "bounced",
            source: "postmark",
            providerEventId,
            metadata: JSON.stringify({
              typeCode: payload.TypeCode,
              description: payload.Description,
            }),
          },
        });
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
          return { processed: false, reason: "duplicate_event" };
        }
        throw err;
      }

      await prisma.announcementDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "failed",
          bounceType: isHardBounce ? "hard" : "soft",
          lastEventAt: new Date(),
        },
      });

      // Hard bounce → email suppression
      if (isHardBounce && payload.Email) {
        await prisma.emailSuppression.upsert({
          where: { email: payload.Email.toLowerCase().trim() },
          create: {
            email: payload.Email.toLowerCase().trim(),
            reason: "hard_bounce",
            details: JSON.stringify({
              typeCode: payload.TypeCode,
              description: payload.Description,
              messageId: MessageID,
            }),
          },
          update: {},
        });
      }

      return { processed: true, deliveryId: delivery.id, newStatus: "failed" };
    }

    case "SpamComplaint": {
      try {
        await prisma.deliveryEvent.create({
          data: {
            deliveryId: delivery.id,
            eventType: "spam_complaint",
            source: "postmark",
            providerEventId,
          },
        });
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
          return { processed: false, reason: "duplicate_event" };
        }
        throw err;
      }

      await prisma.announcementDelivery.update({
        where: { id: delivery.id },
        data: { status: "failed", lastEventAt: new Date() },
      });

      if (payload.Email) {
        await prisma.emailSuppression.upsert({
          where: { email: payload.Email.toLowerCase().trim() },
          create: {
            email: payload.Email.toLowerCase().trim(),
            reason: "spam_complaint",
            details: JSON.stringify({ messageId: MessageID }),
          },
          update: {},
        });
      }

      return { processed: true, deliveryId: delivery.id, newStatus: "failed" };
    }

    case "Open": {
      // Only record first open
      if (!delivery.openedAt) {
        try {
          await prisma.deliveryEvent.create({
            data: {
              deliveryId: delivery.id,
              eventType: "opened",
              source: "postmark",
              providerEventId,
            },
          });
        } catch (err: unknown) {
          if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
            return { processed: false, reason: "duplicate_event" };
          }
          throw err;
        }

        await prisma.announcementDelivery.update({
          where: { id: delivery.id },
          data: { openedAt: new Date(), lastEventAt: new Date() },
        });
      }
      return { processed: true, deliveryId: delivery.id };
    }

    case "Click": {
      // Only record first click
      if (!delivery.clickedAt) {
        try {
          await prisma.deliveryEvent.create({
            data: {
              deliveryId: delivery.id,
              eventType: "clicked",
              source: "postmark",
              providerEventId,
            },
          });
        } catch (err: unknown) {
          if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
            return { processed: false, reason: "duplicate_event" };
          }
          throw err;
        }

        await prisma.announcementDelivery.update({
          where: { id: delivery.id },
          data: { clickedAt: new Date(), lastEventAt: new Date() },
        });
      }
      return { processed: true, deliveryId: delivery.id };
    }

    default:
      return { processed: false, reason: "unknown_record_type" };
  }
}
