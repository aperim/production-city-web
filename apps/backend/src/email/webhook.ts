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

/** Postmark webhook event types we handle. */
export type WebhookEventType = "Delivery" | "Bounce" | "SpamComplaint";

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
      return { processed: true };
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
      return { processed: true };
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
