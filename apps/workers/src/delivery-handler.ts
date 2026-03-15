/**
 * Queue worker handler for announcement_delivery jobs.
 *
 * CRITICAL: This worker is idempotent. At-least-once delivery means
 * we may receive duplicate messages. We check status before sending
 * and use atomic claim to prevent double-sends.
 */

import type { PrismaClient } from "@prisma/client";

export interface AnnouncementDeliveryPayload {
  deliveryId: string;
  announcementId: string;
  subscriptionId: string;
  userId: string;
  channel: "email" | "sms";
}

export interface DeliveryEnv {
  DB: D1Database;
  POSTMARK_API_TOKEN: string;
  SUBSCRIPTION_HMAC_SECRET: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_STATUS_CALLBACK_URL?: string;
  PUBLIC_ORIGIN: string;
  [key: string]: unknown;
}

/**
 * Process a single announcement delivery job.
 *
 * Steps:
 * 1. Fetch delivery record, verify status is 'queued'
 * 2. Atomically claim delivery (status → sending)
 * 3. Fetch announcement + user data from DB
 * 4. Verify user still active, check suppression
 * 5. Render and send via Postmark/Twilio
 * 6. Update delivery with result
 */
export async function processDeliveryJob(
  prisma: PrismaClient,
  env: DeliveryEnv,
  payload: AnnouncementDeliveryPayload,
): Promise<{ processed: boolean; reason?: string }> {
  const { deliveryId } = payload;

  // 1. Fetch delivery record — use stored values, NOT queue payload
  const delivery = await prisma.announcementDelivery.findUnique({
    where: { id: deliveryId },
  });

  if (!delivery) {
    return { processed: false, reason: "delivery_not_found" };
  }

  // Use fields from the authoritative DB record, not the queue message
  const announcementId = delivery.announcementId;
  const userId = delivery.userId;
  const channel = delivery.channel as "email" | "sms";

  // Already sent or delivered — idempotent skip
  if (delivery.status === "sent" || delivery.status === "delivered" || delivery.status === "suppressed") {
    return { processed: false, reason: "already_processed" };
  }

  // Already has external message ID — was sent but status update failed last time
  if (delivery.externalMessageId) {
    return { processed: false, reason: "already_sent" };
  }

  // 2. Atomic claim: only proceed if status is still 'queued'
  const claimed = await prisma.announcementDelivery.updateMany({
    where: { id: deliveryId, status: "queued" },
    data: { status: "sending" },
  });

  if (claimed.count === 0) {
    return { processed: false, reason: "already_claimed" };
  }

  // Record sending event
  await prisma.deliveryEvent.create({
    data: {
      deliveryId,
      eventType: "sending",
      source: "system",
      providerEventId: `system:sending:${deliveryId}`,
    },
  });

  try {
    // 3. Fetch announcement + user data from DB (NOT from queue message)
    const [announcement, user] = await Promise.all([
      prisma.announcement.findUnique({
        where: { id: announcementId },
        include: {
          categoryLinks: {
            include: { category: { select: { name: true } } },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, phone: true, status: true },
      }),
    ]);

    if (!announcement || !user) {
      await markFailed(prisma, deliveryId, "data_not_found", "Announcement or user not found");
      return { processed: true, reason: "data_not_found" };
    }

    // 4. Verify user still active
    if (user.status !== "active") {
      await markSuppressed(prisma, deliveryId, "user_deactivated");
      return { processed: true, reason: "user_deactivated" };
    }

    // 5. Check channel-specific suppression
    if (channel === "email") {
      const suppression = await prisma.emailSuppression.findUnique({
        where: { email: user.email.toLowerCase().trim() },
        select: { removedAt: true },
      });
      if (suppression && suppression.removedAt === null) {
        await markSuppressed(prisma, deliveryId, "email_suppressed");
        return { processed: true, reason: "email_suppressed" };
      }
    }

    if (channel === "sms") {
      if (!user.phone) {
        await markSuppressed(prisma, deliveryId, "no_phone");
        return { processed: true, reason: "no_phone" };
      }
      const suppression = await prisma.smsSuppression.findUnique({
        where: { phoneNumber: user.phone },
        select: { removedAt: true },
      });
      if (suppression && suppression.removedAt === null) {
        await markSuppressed(prisma, deliveryId, "sms_suppressed");
        return { processed: true, reason: "sms_suppressed" };
      }
    }

    // 6. Send
    const categories = announcement.categoryLinks.map((cl) => cl.category.name);
    const origin = env.PUBLIC_ORIGIN;
    const announcementUrl = `${origin}/announcements/${announcement.slug}`;

    if (channel === "email") {
      const result = await sendAnnouncementEmail(prisma, env, {
        deliveryId,
        to: user.email,
        title: announcement.title,
        summary: announcement.summary,
        contentBlocks: JSON.parse(announcement.contentBlocks),
        categories,
        announcementUrl,
      });
      return result;
    }

    if (channel === "sms") {
      const result = await sendAnnouncementSms(prisma, env, {
        deliveryId,
        to: user.phone!,
        title: announcement.title,
        summary: announcement.summary,
        announcementUrl,
      });
      return result;
    }

    await markFailed(prisma, deliveryId, "unknown_channel", `Unknown channel: ${channel}`);
    return { processed: true, reason: "unknown_channel" };
  } catch (err) {
    await markFailed(prisma, deliveryId, "processing_error", String(err));
    throw err; // Re-throw for retry
  }
}

/** Send announcement via email (Postmark). */
async function sendAnnouncementEmail(
  prisma: PrismaClient,
  env: DeliveryEnv,
  params: {
    deliveryId: string;
    to: string;
    title: string;
    summary: string;
    contentBlocks: unknown[];
    categories: string[];
    announcementUrl: string;
  },
): Promise<{ processed: boolean; reason?: string }> {
  const safeTitle = params.title.replace(/[\r\n]/g, "");
  const mediaUrls: Record<string, string> = {};
  const unsubscribeToken = await generateUnsubscribeToken(env.SUBSCRIPTION_HMAC_SECRET, params.deliveryId);
  const unsubscribeUrl = `${env.PUBLIC_ORIGIN}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  // Dynamic import — cross-package import for email rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const announcementTpl = await import("../../backend/src/email/templates/announcement.js") as any;

  const renderParams = {
    title: safeTitle,
    summary: params.summary,
    contentBlocks: params.contentBlocks as unknown[],
    categories: params.categories,
    announcementUrl: params.announcementUrl,
    unsubscribeUrl,
    mediaUrls,
  };

  const htmlBody = announcementTpl.renderAnnouncementHtml(renderParams) as string;
  const textBody = announcementTpl.renderAnnouncementText(renderParams) as string;

  const postmarkResponse = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": env.POSTMARK_API_TOKEN,
    },
    body: JSON.stringify({
      From: "Production City <noreply@mail.production.city>",
      To: params.to,
      Subject: `${safeTitle} — Production City`,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: "broadcasts",
      Tag: "announcement",
      Headers: [
        {
          Name: "List-Unsubscribe",
          Value: `<${unsubscribeUrl}>`,
        },
        {
          Name: "List-Unsubscribe-Post",
          Value: "List-Unsubscribe=One-Click",
        },
      ],
    }),
  });

  const body = await postmarkResponse.json() as { MessageID?: string; ErrorCode?: number; Message?: string };

  if (!postmarkResponse.ok || (body.ErrorCode && body.ErrorCode !== 0)) {
    await markFailed(prisma, params.deliveryId, "postmark_error", body.Message ?? "Unknown error");
    return { processed: true, reason: "postmark_error" };
  }

  // Success — update delivery
  await prisma.announcementDelivery.update({
    where: { id: params.deliveryId },
    data: {
      status: "sent",
      externalMessageId: body.MessageID ?? null,
      sentAt: new Date(),
      lastEventAt: new Date(),
    },
  });

  await prisma.deliveryEvent.create({
    data: {
      deliveryId: params.deliveryId,
      eventType: "sent",
      source: "system",
      providerEventId: `system:sent:${params.deliveryId}`,
      metadata: JSON.stringify({ postmarkMessageId: body.MessageID }),
    },
  });

  return { processed: true };
}

/** Send announcement via SMS (Twilio). */
async function sendAnnouncementSms(
  prisma: PrismaClient,
  env: DeliveryEnv,
  params: {
    deliveryId: string;
    to: string;
    title: string;
    summary: string;
    announcementUrl: string;
  },
): Promise<{ processed: boolean; reason?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const smsRenderer = await import("../../backend/src/lib/sms-renderer.js") as any;

  const smsBody = smsRenderer.renderAnnouncementSms({
    title: params.title,
    summary: params.summary,
    announcementUrl: params.announcementUrl,
  });

  // Find sender number via prefix routing
  const senderNumber = await findSenderNumber(prisma, params.to);
  if (!senderNumber) {
    await markFailed(prisma, params.deliveryId, "no_sender", "No Twilio sender route for recipient");
    return { processed: true, reason: "no_sender" };
  }

  // Send via Twilio REST API
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const twilioBody = new URLSearchParams({
    From: senderNumber,
    To: params.to,
    Body: smsBody,
  });
  if (env.TWILIO_STATUS_CALLBACK_URL) {
    twilioBody.set("StatusCallback", env.TWILIO_STATUS_CALLBACK_URL);
  }

  const twilioAuth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  const twilioResponse = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${twilioAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: twilioBody.toString(),
  });

  const twilioResult = await twilioResponse.json() as {
    sid?: string;
    status?: string;
    code?: number;
    message?: string;
  };

  if (!twilioResponse.ok) {
    // Handle specific Twilio error codes
    if (twilioResult.code === 21610) {
      // Unsubscribed
      await markFailed(prisma, params.deliveryId, "twilio_unsubscribed", "Recipient unsubscribed");
      try {
        await prisma.smsSuppression.create({
          data: {
            phoneNumber: params.to,
            reason: "twilio_unsubscribed",
            providerEventId: twilioResult.sid ?? null,
          },
        });
      } catch {
        // Already in suppression
      }
    } else {
      await markFailed(prisma, params.deliveryId, "twilio_error", twilioResult.message ?? "Unknown error");
    }
    return { processed: true, reason: "twilio_error" };
  }

  // Success — update delivery
  await prisma.announcementDelivery.update({
    where: { id: params.deliveryId },
    data: {
      status: "sent",
      externalMessageId: twilioResult.sid ?? null,
      sentAt: new Date(),
      lastEventAt: new Date(),
    },
  });

  await prisma.deliveryEvent.create({
    data: {
      deliveryId: params.deliveryId,
      eventType: "sent",
      source: "system",
      providerEventId: `system:sent:${params.deliveryId}`,
      metadata: JSON.stringify({ twilioSid: twilioResult.sid }),
    },
  });

  return { processed: true };
}

/** Find the Twilio sender number via prefix-based routing. */
async function findSenderNumber(prisma: PrismaClient, recipientPhone: string): Promise<string | null> {
  const routes = await prisma.twilioSenderRoute.findMany();

  // Find longest prefix match
  let bestMatch: { phoneNumber: string; prefixLen: number } | null = null;
  for (const route of routes) {
    const prefixes: string[] = JSON.parse(route.prefixes);
    for (const prefix of prefixes) {
      if (recipientPhone.startsWith(prefix)) {
        if (!bestMatch || prefix.length > bestMatch.prefixLen) {
          bestMatch = { phoneNumber: route.phoneNumber, prefixLen: prefix.length };
        }
      }
    }
  }

  if (bestMatch) return bestMatch.phoneNumber;

  // Fall back to default sender
  const defaultRoute = routes.find((r) => r.isDefault === 1);
  return defaultRoute?.phoneNumber ?? null;
}

/** Mark a delivery as failed. */
async function markFailed(
  prisma: PrismaClient,
  deliveryId: string,
  reason: string,
  errorMessage: string,
): Promise<void> {
  await prisma.announcementDelivery.update({
    where: { id: deliveryId },
    data: {
      status: "failed",
      errorMessage,
      lastEventAt: new Date(),
    },
  });

  await prisma.deliveryEvent.create({
    data: {
      deliveryId,
      eventType: "failed",
      source: "system",
      providerEventId: `system:failed:${deliveryId}:${reason}`,
      metadata: JSON.stringify({ reason, errorMessage }),
    },
  });
}

/**
 * Generate an HMAC-signed unsubscribe token for a delivery.
 * Token format: deliveryId:hmac — verifiable without DB lookup.
 */
async function generateUnsubscribeToken(hmacSecret: string, deliveryId: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(hmacSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(`unsubscribe:${deliveryId}`));
  const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${deliveryId}:${hex}`;
}

/**
 * Verify an unsubscribe token and extract the delivery ID.
 * Returns the delivery ID if valid, null otherwise.
 */
export async function verifyUnsubscribeToken(hmacSecret: string, token: string): Promise<string | null> {
  const colonIdx = token.indexOf(":");
  if (colonIdx === -1) return null;
  const deliveryId = token.slice(0, colonIdx);
  const providedHmac = token.slice(colonIdx + 1);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(hmacSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(`unsubscribe:${deliveryId}`));
  const expectedHmac = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");

  // Constant-time comparison
  if (expectedHmac.length !== providedHmac.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expectedHmac.length; i++) {
    mismatch |= expectedHmac.charCodeAt(i) ^ providedHmac.charCodeAt(i);
  }
  return mismatch === 0 ? deliveryId : null;
}

/** Mark a delivery as suppressed. */
async function markSuppressed(
  prisma: PrismaClient,
  deliveryId: string,
  reason: string,
): Promise<void> {
  await prisma.announcementDelivery.update({
    where: { id: deliveryId },
    data: {
      status: "suppressed",
      errorMessage: reason,
      lastEventAt: new Date(),
    },
  });

  await prisma.deliveryEvent.create({
    data: {
      deliveryId,
      eventType: "suppressed",
      source: "system",
      providerEventId: `system:suppressed:${deliveryId}`,
      metadata: JSON.stringify({ reason }),
    },
  });
}
