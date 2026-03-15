/**
 * Twilio status callback webhook for SMS delivery disposition tracking.
 * POST /v1/webhooks/twilio/status
 *
 * Receives delivery status updates from Twilio and updates AnnouncementDelivery records.
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { validateTwilioSignature } from "./twilio-inbound.js";

type Bindings = {
  DB: D1Database;
  TWILIO_AUTH_TOKEN: string;
};

export const twilioStatusApp = new OpenAPIHono<{ Bindings: Bindings }>();

const TwilioStatusSchema = z.object({
  MessageSid: z.string(),
  MessageStatus: z.string(),
  ErrorCode: z.string().optional(),
  ErrorMessage: z.string().optional(),
});

const twilioStatusRoute = createRoute({
  method: "post",
  path: "/v1/webhooks/twilio/status",
  summary: "Twilio SMS status callback",
  request: {
    body: { content: { "application/x-www-form-urlencoded": { schema: TwilioStatusSchema } } },
  },
  responses: {
    200: { description: "Processed" },
  },
});

/** Monotonic status progression for SMS deliveries. */
const STATUS_ORDER: Record<string, number> = {
  queued: 0,
  sending: 1,
  sent: 2,
  delivered: 3,
  failed: 4,
  suppressed: 5,
};

/** Map Twilio statuses to our delivery statuses. */
const TWILIO_STATUS_MAP: Record<string, string> = {
  queued: "sending",
  sent: "sent",
  delivered: "delivered",
  undelivered: "failed",
  failed: "failed",
};

twilioStatusApp.openapi(twilioStatusRoute, async (c) => {
  // Validate Twilio signature
  const signature = c.req.header("X-Twilio-Signature") ?? "";
  if (!signature) {
    return c.text("", 403);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const formData = await c.req.parseBody();

    // Validate signature against form params
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === "string") params[key] = value;
    }
    const requestUrl = new URL(c.req.url);
    const validationUrl = `${requestUrl.origin}${requestUrl.pathname}`;
    const isValid = await validateTwilioSignature(c.env.TWILIO_AUTH_TOKEN, validationUrl, params, signature);
    if (!isValid) {
      return c.text("", 403);
    }

    const messageSid = String(formData.MessageSid ?? "");
    const messageStatus = String(formData.MessageStatus ?? "");
    const errorCode = formData.ErrorCode ? String(formData.ErrorCode) : null;

    if (!messageSid || !messageStatus) {
      return c.text("", 200);
    }

    // Find delivery by external message ID
    const delivery = await prisma.announcementDelivery.findFirst({
      where: { externalMessageId: messageSid, channel: "sms" },
    });

    if (!delivery) {
      // Not an announcement delivery SMS — ignore
      return c.text("", 200);
    }

    const newStatus = TWILIO_STATUS_MAP[messageStatus];
    if (!newStatus) {
      // Unknown Twilio status — ignore
      return c.text("", 200);
    }

    // Monotonic status check — don't regress
    const currentOrder = STATUS_ORDER[delivery.status] ?? -1;
    const newOrder = STATUS_ORDER[newStatus] ?? -1;
    if (newOrder <= currentOrder) {
      return c.text("", 200);
    }

    // Create delivery event with providerEventId for dedup
    const providerEventId = `twilio:${messageSid}:${messageStatus}`;
    try {
      await prisma.deliveryEvent.create({
        data: {
          deliveryId: delivery.id,
          eventType: newStatus === "failed" ? "failed" : newStatus,
          source: "twilio",
          providerEventId,
          metadata: JSON.stringify({
            twilioStatus: messageStatus,
            errorCode,
          }),
        },
      });
    } catch (err: unknown) {
      // Unique constraint — duplicate event, skip
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return c.text("", 200);
      }
      throw err;
    }

    // Update delivery status
    const updateData: Record<string, unknown> = {
      status: newStatus,
      lastEventAt: new Date(),
    };

    if (newStatus === "sent") {
      updateData.sentAt = new Date();
    }
    if (newStatus === "delivered") {
      updateData.deliveredAt = new Date();
    }
    if (newStatus === "failed") {
      updateData.twilioErrorCode = errorCode;
      updateData.errorMessage = formData.ErrorMessage ? String(formData.ErrorMessage) : null;
    }

    await prisma.announcementDelivery.update({
      where: { id: delivery.id },
      data: updateData,
    });

    // Handle Twilio unsubscribed error (21610)
    if (errorCode === "21610") {
      // Find the user's phone and add to SMS suppression
      const user = await prisma.user.findUnique({
        where: { id: delivery.userId },
        select: { phone: true },
      });
      if (user?.phone) {
        try {
          await prisma.smsSuppression.create({
            data: {
              phoneNumber: user.phone,
              reason: "twilio_unsubscribed",
              providerEventId: messageSid,
            },
          });
        } catch {
          // Already in suppression list
        }
      }
    }

    return c.text("", 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
