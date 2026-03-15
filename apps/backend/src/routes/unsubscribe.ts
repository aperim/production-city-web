/**
 * Unsubscribe endpoint for email/SMS links.
 * POST /v1/subscriptions/unsubscribe — performs unsubscribe via token
 *
 * Token is time-limited (30 days), one-time use, stored hashed on delivery.
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { hashConfirmationToken } from "../lib/subscription-service.js";
import { createAuditLog } from "../auth/audit.js";
import { t } from "../i18n/index.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.js";
import { hmacSha256Hex } from "../email/service.js";

type Bindings = {
  DB: D1Database;
  SUBSCRIPTION_HMAC_SECRET: string;
};

export const unsubscribeApp = new OpenAPIHono<{ Bindings: Bindings }>();

const UnsubscribeSchema = z.object({
  token: z.string().min(1),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

const unsubscribeRoute = createRoute({
  method: "post",
  path: "/v1/subscriptions/unsubscribe",
  summary: "Unsubscribe via token from email/SMS",
  request: {
    body: { content: { "application/json": { schema: UnsubscribeSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Unsubscribed" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid or expired token" },
  },
});

// Rate limit: 20 requests per IP per 10 minutes
const unsubscribeRateLimit = rateLimitMiddleware({
  keyFn: (c) => c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown",
  limit: 20,
  windowSeconds: 600,
});

unsubscribeApp.use("/v1/subscriptions/unsubscribe", unsubscribeRateLimit);

/**
 * Verify a delivery-based unsubscribe token (deliveryId:hmac format).
 * Returns the delivery ID if valid, null otherwise.
 */
async function verifyDeliveryUnsubscribeToken(hmacSecret: string, token: string): Promise<string | null> {
  const colonIdx = token.indexOf(":");
  if (colonIdx === -1) return null;
  const deliveryId = token.slice(0, colonIdx);
  const providedHmac = token.slice(colonIdx + 1);

  const expectedHmac = await hmacSha256Hex(hmacSecret, `unsubscribe:${deliveryId}`);

  // Constant-time comparison
  if (expectedHmac.length !== providedHmac.length) return null;
  let mismatch = 0;
  for (let i = 0; i < expectedHmac.length; i++) {
    mismatch |= expectedHmac.charCodeAt(i) ^ providedHmac.charCodeAt(i);
  }
  return mismatch === 0 ? deliveryId : null;
}

unsubscribeApp.openapi(unsubscribeRoute, async (c) => {
  const { token } = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Try delivery-based unsubscribe token first (deliveryId:hmac format)
    const deliveryId = await verifyDeliveryUnsubscribeToken(c.env.SUBSCRIPTION_HMAC_SECRET, token);
    if (deliveryId) {
      const delivery = await prisma.announcementDelivery.findUnique({
        where: { id: deliveryId },
        select: { subscriptionId: true, userId: true, channel: true },
      });
      if (delivery) {
        const sub = await prisma.categorySubscription.findUnique({
          where: { id: delivery.subscriptionId },
        });
        if (sub) {
          // Soft-decline: delivery records reference the subscription via FK,
          // so we update status to 'declined' instead of deleting.
          await prisma.categorySubscription.update({
            where: { id: sub.id },
            data: { status: "declined", declinedAt: new Date() },
          });
          await createAuditLog(prisma, {
            action: "subscription:unsubscribe",
            resource: "subscription",
            subjectId: delivery.userId,
            details: { subscriptionId: sub.id, channel: delivery.channel, categoryId: sub.categoryId },
          });
          return c.json({ message: t("subscriptions.deleted") }, 200);
        }
      }
    }

    // Fall back to subscription confirmation token lookup
    const tokenHash = await hashConfirmationToken(c.env.SUBSCRIPTION_HMAC_SECRET, token);

    // Find subscription by confirmation token hash
    const sub = await prisma.categorySubscription.findFirst({
      where: {
        confirmationTokenHash: tokenHash,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    if (!sub) {
      return c.json({ error: "INVALID_TOKEN", message: t("subscriptions.invalidToken") }, 404);
    }

    // Check token expiry (30-day window from delivery)
    if (sub.expiresAt && sub.expiresAt < new Date()) {
      return c.json({ error: "INVALID_TOKEN", message: t("subscriptions.invalidToken") }, 404);
    }

    // Delete the subscription
    await prisma.categorySubscription.delete({ where: { id: sub.id } });

    await createAuditLog(prisma, {
      action: "subscription:unsubscribe",
      resource: "subscription",
      subjectId: sub.userId,
      details: { subscriptionId: sub.id, channel: sub.channel, categoryId: sub.categoryId },
    });

    return c.json({ message: t("subscriptions.deleted") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
