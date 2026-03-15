/**
 * Twilio inbound webhook for SMS STOP/START opt-out handling.
 * POST /v1/webhooks/twilio/inbound
 *
 * CRITICAL for TCPA compliance: syncs Twilio-level STOP opt-outs locally.
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { createAuditLog } from "../auth/audit.js";

type Bindings = {
  DB: D1Database;
  TWILIO_AUTH_TOKEN: string;
};

export const twilioInboundApp = new OpenAPIHono<{ Bindings: Bindings }>();

// STOP keywords that Twilio recognizes
const STOP_KEYWORDS = ["stop", "stopall", "unsubscribe", "cancel", "end", "quit"];
const START_KEYWORDS = ["start", "unstop", "subscribe", "resume"];

const TwilioInboundSchema = z.object({
  From: z.string(),
  To: z.string(),
  Body: z.string(),
  MessageSid: z.string().optional(),
});

const twilioInboundRoute = createRoute({
  method: "post",
  path: "/v1/webhooks/twilio/inbound",
  summary: "Twilio inbound SMS webhook (STOP/START handling)",
  request: {
    body: { content: { "application/x-www-form-urlencoded": { schema: TwilioInboundSchema } } },
  },
  responses: {
    200: { description: "Processed" },
  },
});

/**
 * Validate Twilio request signature.
 * Uses HMAC-SHA1 as per Twilio's spec.
 */
export async function validateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string,
): Promise<boolean> {
  // Build data string: URL + sorted params
  const sortedKeys = Object.keys(params).sort();
  let dataString = url;
  for (const key of sortedKeys) {
    dataString += key + params[key];
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(dataString));

  // Convert to base64
  const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));

  // Constant-time comparison
  if (computed.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

twilioInboundApp.openapi(twilioInboundRoute, async (c) => {
  // Validate Twilio signature
  const signature = c.req.header("X-Twilio-Signature") ?? "";
  if (!signature) {
    return c.text("", 403);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Parse form body
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

    const from = String(formData.From ?? "");
    const body = String(formData.Body ?? "").trim().toLowerCase();
    const messageSid = String(formData.MessageSid ?? "");

    if (!from || !body) {
      return c.text("", 200);
    }

    const isStop = STOP_KEYWORDS.includes(body);
    const isStart = START_KEYWORDS.includes(body);

    if (!isStop && !isStart) {
      // Not an opt-out/opt-in keyword, ignore
      return c.text("", 200);
    }

    if (isStop) {
      // Add to SMS suppression
      try {
        await prisma.smsSuppression.create({
          data: {
            phoneNumber: from,
            reason: "stop_keyword",
            providerEventId: messageSid || null,
          },
        });
      } catch (err: unknown) {
        // Unique constraint — already suppressed
        if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
          // Already in suppression list, update removedAt to null
          await prisma.smsSuppression.update({
            where: { phoneNumber: from },
            data: { removedAt: null, reason: "stop_keyword" },
          });
        } else {
          throw err;
        }
      }

      // Find user by phone and decline all SMS subscriptions
      const user = await prisma.user.findUnique({
        where: { phone: from },
        select: { id: true },
      });

      if (user) {
        await prisma.categorySubscription.updateMany({
          where: {
            userId: user.id,
            channel: "sms",
            status: { in: ["pending", "confirmed"] },
          },
          data: {
            status: "declined",
            declinedAt: new Date(),
          },
        });
      }

      await createAuditLog(prisma, {
        action: "sms:stop",
        resource: "sms_suppression",
        details: { messageSid },
      });
    }

    if (isStart) {
      // Remove from suppression list (set removedAt)
      try {
        await prisma.smsSuppression.update({
          where: { phoneNumber: from },
          data: { removedAt: new Date() },
        });
      } catch {
        // Not in suppression list, that's fine
      }

      await createAuditLog(prisma, {
        action: "sms:start",
        resource: "sms_suppression",
        details: { messageSid },
      });
    }

    // Twilio expects 200
    return c.text("", 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
