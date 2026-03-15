/**
 * User subscription routes:
 * GET    /v1/me/subscriptions              — list my subscriptions
 * POST   /v1/me/subscriptions              — subscribe to a category
 * DELETE /v1/me/subscriptions/:id          — unsubscribe
 * POST   /v1/me/subscriptions/:id/resend   — resend confirmation
 *
 * Public confirmation routes:
 * POST   /v1/subscriptions/confirm          — confirm double opt-in
 * POST   /v1/subscriptions/decline          — decline subscription
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { createAuditLog } from "../auth/audit.js";
import { t } from "../i18n/index.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.js";
import {
  generateConfirmationToken,
  hashConfirmationToken,
  getExpirationDate,
  checkResendRateLimit,
} from "../lib/subscription-service.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  SUBSCRIPTION_HMAC_SECRET: string;
};

export const subscriptionsApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

// --- Schemas ---

const SubscriptionResponseSchema = z.object({
  id: z.string(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
  channel: z.string(),
  status: z.string(),
  confirmedAt: z.string().nullable(),
  createdAt: z.string(),
});

const SubscriptionListResponseSchema = z.object({
  subscriptions: z.array(SubscriptionResponseSchema),
});

const CreateSubscriptionSchema = z.object({
  categoryId: z.string(),
  channels: z.array(z.enum(["email", "sms"])).min(1),
});

const ConfirmTokenSchema = z.object({
  token: z.string().min(1),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

// --- Rate limiting ---

const confirmRateLimit = rateLimitMiddleware({
  keyFn: (c) => c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown",
  limit: 20,
  windowSeconds: 600,
});

// --- Route definitions ---

const listMySubscriptionsRoute = createRoute({
  method: "get",
  path: "/v1/me/subscriptions",
  summary: "List my subscriptions",
  responses: {
    200: { content: { "application/json": { schema: SubscriptionListResponseSchema } }, description: "Subscriptions" },
  },
});

const createSubscriptionRoute = createRoute({
  method: "post",
  path: "/v1/me/subscriptions",
  summary: "Subscribe to a category",
  request: {
    body: { content: { "application/json": { schema: CreateSubscriptionSchema } } },
  },
  responses: {
    201: { content: { "application/json": { schema: z.object({ subscriptions: z.array(SubscriptionResponseSchema), message: z.string() }) } }, description: "Created" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Already subscribed" },
    422: { content: { "application/json": { schema: ErrorSchema } }, description: "Validation error" },
  },
});

const deleteSubscriptionRoute = createRoute({
  method: "delete",
  path: "/v1/me/subscriptions/{id}",
  summary: "Unsubscribe",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Unsubscribed" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const resendConfirmationRoute = createRoute({
  method: "post",
  path: "/v1/me/subscriptions/{id}/resend",
  summary: "Resend confirmation",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Resent" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    429: { content: { "application/json": { schema: ErrorSchema } }, description: "Rate limited" },
  },
});

const confirmSubscriptionRoute = createRoute({
  method: "post",
  path: "/v1/subscriptions/confirm",
  summary: "Confirm double opt-in",
  request: {
    body: { content: { "application/json": { schema: ConfirmTokenSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string(), subscription: SubscriptionResponseSchema }) } }, description: "Confirmed" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid or expired" },
  },
});

const declineSubscriptionRoute = createRoute({
  method: "post",
  path: "/v1/subscriptions/decline",
  summary: "Decline subscription",
  request: {
    body: { content: { "application/json": { schema: ConfirmTokenSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Declined" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid or expired" },
  },
});

// --- Auth middleware for /v1/me/subscriptions ---

subscriptionsApp.use("/v1/me/subscriptions", authMiddleware());
subscriptionsApp.use("/v1/me/subscriptions/*", authMiddleware());

// --- Rate limiting ---

subscriptionsApp.use("/v1/subscriptions/confirm", confirmRateLimit);
subscriptionsApp.use("/v1/subscriptions/decline", confirmRateLimit);

// --- Helpers ---

function formatSubscription(sub: {
  id: string;
  channel: string;
  status: string;
  confirmedAt: Date | null;
  createdAt: Date;
  category: { id: string; name: string; slug: string };
}) {
  return {
    id: sub.id,
    category: { id: sub.category.id, name: sub.category.name, slug: sub.category.slug },
    channel: sub.channel,
    status: sub.status,
    confirmedAt: sub.confirmedAt?.toISOString() ?? null,
    createdAt: sub.createdAt.toISOString(),
  };
}

// --- Handlers ---

// List my subscriptions
subscriptionsApp.openapi(listMySubscriptionsRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const subs = await prisma.categorySubscription.findMany({
      where: { userId: auth.user.id },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });

    return c.json({
      subscriptions: subs.map(formatSubscription),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Subscribe to a category
subscriptionsApp.openapi(createSubscriptionRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const body = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Validate category exists and is active
    const category = await prisma.announcementCategory.findUnique({
      where: { id: body.categoryId },
    });
    if (!category) {
      return c.json({ error: "CATEGORY_NOT_FOUND", message: t("subscriptions.categoryNotFound") }, 422 as never);
    }
    if (category.isActive !== 1) {
      return c.json({ error: "CATEGORY_INACTIVE", message: t("subscriptions.categoryInactive") }, 422 as never);
    }

    // Load user with phone
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true, phone: true },
    });

    // SMS validation: check phone number
    if (body.channels.includes("sms") && !user?.phone) {
      return c.json({ error: "NO_PHONE", message: t("subscriptions.noPhone") }, 422 as never);
    }

    const createdSubs = [];

    for (const channel of body.channels) {
      // Check for existing subscription
      const existing = await prisma.categorySubscription.findUnique({
        where: {
          userId_categoryId_channel: {
            userId: auth.user.id,
            categoryId: body.categoryId,
            channel,
          },
        },
        include: { category: { select: { id: true, name: true, slug: true } } },
      });

      if (existing) {
        if (existing.status === "confirmed") {
          return c.json({
            error: "ALREADY_SUBSCRIBED",
            message: t("subscriptions.alreadySubscribed", { categoryName: category.name, channel }),
          }, 409);
        }

        if (existing.status === "pending") {
          // Resend confirmation, return 200
          const allowed = await checkResendRateLimit(prisma, existing.id);
          if (allowed) {
            const { token: _token, tokenHash } = await generateConfirmationToken(c.env.SUBSCRIPTION_HMAC_SECRET);
            await prisma.categorySubscription.update({
              where: { id: existing.id },
              data: {
                confirmationTokenHash: tokenHash,
                expiresAt: getExpirationDate(channel as "email" | "sms"),
              },
            });
            await createAuditLog(prisma, {
              actorId: auth.user.id,
              action: "subscription:resend",
              resource: "subscription",
              details: { subscriptionId: existing.id, channel },
            });
          }
          createdSubs.push(formatSubscription(existing));
          continue;
        }

        // Expired or declined: delete old and create new
        await prisma.categorySubscription.delete({ where: { id: existing.id } });
      }

      // Create new subscription
      const { token: _token, tokenHash } = await generateConfirmationToken(c.env.SUBSCRIPTION_HMAC_SECRET);
      const expiresAt = getExpirationDate(channel as "email" | "sms");

      const sub = await prisma.categorySubscription.create({
        data: {
          userId: auth.user.id,
          categoryId: body.categoryId,
          channel,
          status: "pending",
          confirmationTokenHash: tokenHash,
          expiresAt,
          subscribedById: auth.user.id,
        },
        include: { category: { select: { id: true, name: true, slug: true } } },
      });

      await createAuditLog(prisma, {
        actorId: auth.user.id,
        action: "subscription:create",
        resource: "subscription",
        details: { subscriptionId: sub.id, categoryId: body.categoryId, channel },
      });

      createdSubs.push(formatSubscription(sub));
    }

    return c.json({
      subscriptions: createdSubs,
      message: t("subscriptions.created"),
    }, 201);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Unsubscribe
subscriptionsApp.openapi(deleteSubscriptionRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const sub = await prisma.categorySubscription.findUnique({
      where: { id },
    });
    if (!sub || sub.userId !== auth.user.id) {
      return c.json({ error: "NOT_FOUND", message: t("subscriptions.notFound") }, 404);
    }

    await prisma.categorySubscription.delete({ where: { id } });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "subscription:delete",
      resource: "subscription",
      details: { subscriptionId: id, channel: sub.channel },
    });

    return c.json({ message: t("subscriptions.deleted") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Resend confirmation
subscriptionsApp.openapi(resendConfirmationRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const sub = await prisma.categorySubscription.findUnique({
      where: { id },
    });
    if (!sub || sub.userId !== auth.user.id) {
      return c.json({ error: "NOT_FOUND", message: t("subscriptions.notFound") }, 404);
    }
    if (sub.status !== "pending") {
      return c.json({ error: "NOT_PENDING", message: t("subscriptions.notFound") }, 404);
    }

    // Rate limit check
    const allowed = await checkResendRateLimit(prisma, id);
    if (!allowed) {
      return c.json({
        error: "RESEND_RATE_LIMITED",
        message: t("subscriptions.resendRateLimited", { channel: sub.channel }),
      }, 429);
    }

    // Generate new token
    const { token: _token, tokenHash } = await generateConfirmationToken(c.env.SUBSCRIPTION_HMAC_SECRET);
    await prisma.categorySubscription.update({
      where: { id },
      data: {
        confirmationTokenHash: tokenHash,
        expiresAt: getExpirationDate(sub.channel as "email" | "sms"),
      },
    });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "subscription:resend",
      resource: "subscription",
      details: { subscriptionId: id, channel: sub.channel },
    });

    return c.json({ message: t("subscriptions.confirmationResent") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Confirm subscription (public)
subscriptionsApp.openapi(confirmSubscriptionRoute, async (c) => {
  const { token } = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const tokenHash = await hashConfirmationToken(c.env.SUBSCRIPTION_HMAC_SECRET, token);

    const sub = await prisma.categorySubscription.findFirst({
      where: {
        confirmationTokenHash: tokenHash,
        status: "pending",
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    // Uniform error: don't differentiate not-found vs expired
    if (!sub || sub.expiresAt < new Date()) {
      return c.json({ error: "INVALID_TOKEN", message: t("subscriptions.invalidToken") }, 404);
    }

    const updated = await prisma.categorySubscription.update({
      where: { id: sub.id },
      data: {
        status: "confirmed",
        confirmedAt: new Date(),
        confirmationTokenHash: null,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    await createAuditLog(prisma, {
      action: "subscription:confirm",
      resource: "subscription",
      subjectId: sub.userId,
      details: { subscriptionId: sub.id, channel: sub.channel },
    });

    return c.json({
      message: t("subscriptions.confirmSuccess", {
        categoryName: sub.category.name,
        channel: sub.channel,
      }),
      subscription: formatSubscription(updated),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Decline subscription (public)
subscriptionsApp.openapi(declineSubscriptionRoute, async (c) => {
  const { token } = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const tokenHash = await hashConfirmationToken(c.env.SUBSCRIPTION_HMAC_SECRET, token);

    const sub = await prisma.categorySubscription.findFirst({
      where: {
        confirmationTokenHash: tokenHash,
        status: "pending",
      },
    });

    // Uniform error
    if (!sub || sub.expiresAt < new Date()) {
      return c.json({ error: "INVALID_TOKEN", message: t("subscriptions.invalidToken") }, 404);
    }

    await prisma.categorySubscription.update({
      where: { id: sub.id },
      data: {
        status: "declined",
        declinedAt: new Date(),
        confirmationTokenHash: null,
      },
    });

    await createAuditLog(prisma, {
      action: "subscription:decline",
      resource: "subscription",
      subjectId: sub.userId,
      details: { subscriptionId: sub.id, channel: sub.channel },
    });

    return c.json({ message: t("subscriptions.declineSuccess") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
