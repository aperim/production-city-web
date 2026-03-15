/**
 * Admin subscription routes:
 * GET    /v1/admin/subscriptions          — list all subscriptions (filterable)
 * POST   /v1/admin/subscriptions          — subscribe a user to a category
 * DELETE /v1/admin/subscriptions/:id      — remove a subscription
 * GET    /v1/admin/subscriptions/stats    — subscription stats by category
 * POST   /v1/admin/subscriptions/:id/resend — resend confirmation
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { createAuditLog } from "../auth/audit.js";
import { t } from "../i18n/index.js";
import {
  generateConfirmationToken,
  getExpirationDate,
  checkResendRateLimit,
  checkAdminSubscribeRateLimit,
  checkTargetUserPendingLimit,
  maskPhoneNumber,
  maskEmail,
} from "../lib/subscription-service.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  SUBSCRIPTION_HMAC_SECRET: string;
};

export const adminSubscriptionsApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

// --- Schemas ---

const AdminSubscriptionSchema = z.object({
  id: z.string(),
  category: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  channel: z.string(),
  status: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string(),
    phone: z.string().nullable(),
  }),
  subscribedBy: z.object({ id: z.string(), name: z.string().nullable() }).nullable(),
  confirmedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  declinedAt: z.string().nullable(),
  createdAt: z.string(),
});

const AdminSubscriptionListSchema = z.object({
  subscriptions: z.array(AdminSubscriptionSchema),
  pagination: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

const AdminCreateSubscriptionSchema = z.object({
  userId: z.string(),
  categoryId: z.string(),
  channels: z.array(z.enum(["email", "sms"])).min(1),
});

const StatsResponseSchema = z.object({
  stats: z.array(z.object({
    category: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
    confirmed: z.object({ email: z.number(), sms: z.number() }),
    pending: z.object({ email: z.number(), sms: z.number() }),
    total: z.number(),
  })),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

// --- Route definitions ---

const listSubscriptionsRoute = createRoute({
  method: "get",
  path: "/v1/admin/subscriptions",
  summary: "List all subscriptions",
  responses: {
    200: { content: { "application/json": { schema: AdminSubscriptionListSchema } }, description: "Subscriptions" },
    403: { content: { "application/json": { schema: ErrorSchema } }, description: "Forbidden" },
  },
});

const statsRoute = createRoute({
  method: "get",
  path: "/v1/admin/subscriptions/stats",
  summary: "Subscription stats by category",
  responses: {
    200: { content: { "application/json": { schema: StatsResponseSchema } }, description: "Stats" },
    403: { content: { "application/json": { schema: ErrorSchema } }, description: "Forbidden" },
  },
});

const adminCreateSubscriptionRoute = createRoute({
  method: "post",
  path: "/v1/admin/subscriptions",
  summary: "Subscribe a user to a category",
  request: {
    body: { content: { "application/json": { schema: AdminCreateSubscriptionSchema } } },
  },
  responses: {
    201: { content: { "application/json": { schema: z.object({ subscriptions: z.array(AdminSubscriptionSchema), message: z.string() }) } }, description: "Created" },
    403: { content: { "application/json": { schema: ErrorSchema } }, description: "Forbidden" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Already subscribed" },
    422: { content: { "application/json": { schema: ErrorSchema } }, description: "Validation error" },
    429: { content: { "application/json": { schema: ErrorSchema } }, description: "Rate limited" },
  },
});

const adminDeleteSubscriptionRoute = createRoute({
  method: "delete",
  path: "/v1/admin/subscriptions/{id}",
  summary: "Remove a subscription",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Removed" },
    403: { content: { "application/json": { schema: ErrorSchema } }, description: "Forbidden" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const adminResendRoute = createRoute({
  method: "post",
  path: "/v1/admin/subscriptions/{id}/resend",
  summary: "Resend confirmation (admin)",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Resent" },
    403: { content: { "application/json": { schema: ErrorSchema } }, description: "Forbidden" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    429: { content: { "application/json": { schema: ErrorSchema } }, description: "Rate limited" },
  },
});

// --- Auth middleware ---

adminSubscriptionsApp.use("/v1/admin/subscriptions", authMiddleware());
adminSubscriptionsApp.use("/v1/admin/subscriptions/*", authMiddleware());

// --- Helpers ---

function formatAdminSubscription(
  sub: {
    id: string;
    channel: string;
    status: string;
    confirmedAt: Date | null;
    expiresAt: Date;
    declinedAt: Date | null;
    createdAt: Date;
    category: { id: string; name: string; slug: string };
    user: { id: string; name: string | null; email: string; phone: string | null };
    subscribedBy: { id: string; name: string | null } | null;
  },
  canReadPii: boolean,
) {
  return {
    id: sub.id,
    category: { id: sub.category.id, name: sub.category.name, slug: sub.category.slug },
    channel: sub.channel,
    status: sub.status,
    user: {
      id: sub.user.id,
      name: sub.user.name,
      email: canReadPii ? sub.user.email : maskEmail(sub.user.email),
      phone: sub.user.phone
        ? (canReadPii ? sub.user.phone : maskPhoneNumber(sub.user.phone))
        : null,
    },
    subscribedBy: sub.subscribedBy
      ? { id: sub.subscribedBy.id, name: sub.subscribedBy.name }
      : null,
    confirmedAt: sub.confirmedAt?.toISOString() ?? null,
    expiresAt: sub.expiresAt.toISOString(),
    declinedAt: sub.declinedAt?.toISOString() ?? null,
    createdAt: sub.createdAt.toISOString(),
  };
}

// --- Handlers ---

// Stats route (MUST be before parameterized routes)
adminSubscriptionsApp.openapi(statsRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("subscription:read")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const categories = await prisma.announcementCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });

    const stats = await Promise.all(categories.map(async (cat) => {
      const [confirmedEmail, confirmedSms, pendingEmail, pendingSms] = await Promise.all([
        prisma.categorySubscription.count({ where: { categoryId: cat.id, status: "confirmed", channel: "email" } }),
        prisma.categorySubscription.count({ where: { categoryId: cat.id, status: "confirmed", channel: "sms" } }),
        prisma.categorySubscription.count({ where: { categoryId: cat.id, status: "pending", channel: "email" } }),
        prisma.categorySubscription.count({ where: { categoryId: cat.id, status: "pending", channel: "sms" } }),
      ]);

      return {
        category: { id: cat.id, name: cat.name, slug: cat.slug },
        confirmed: { email: confirmedEmail, sms: confirmedSms },
        pending: { email: pendingEmail, sms: pendingSms },
        total: confirmedEmail + confirmedSms + pendingEmail + pendingSms,
      };
    }));

    return c.json({ stats }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// List all subscriptions
adminSubscriptionsApp.openapi(listSubscriptionsRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("subscription:read")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const canReadPii = auth.permissions.includes("subscription:read_pii");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const page = parseInt(c.req.query("page") ?? "1", 10);
    const pageSize = Math.min(parseInt(c.req.query("pageSize") ?? "50", 10), 100);
    const status = c.req.query("status");
    const categoryId = c.req.query("categoryId");
    const channel = c.req.query("channel");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (channel) where.channel = channel;

    const [subs, total] = await Promise.all([
      prisma.categorySubscription.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
          subscribedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.categorySubscription.count({ where }),
    ]);

    return c.json({
      subscriptions: subs.map((sub) => formatAdminSubscription(sub, canReadPii)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin create subscription
adminSubscriptionsApp.openapi(adminCreateSubscriptionRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("subscription:manage")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const body = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Admin rate limit check
    const adminAllowed = await checkAdminSubscribeRateLimit(prisma, auth.user.id);
    if (!adminAllowed) {
      return c.json({ error: "RATE_LIMITED", message: t("subscriptions.rateLimited") }, 429);
    }

    // Target user pending limit check
    const targetAllowed = await checkTargetUserPendingLimit(prisma, body.userId);
    if (!targetAllowed) {
      return c.json({ error: "RATE_LIMITED", message: t("subscriptions.rateLimited") }, 429);
    }

    // Validate target user exists and is active
    const targetUser = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { id: true, name: true, email: true, phone: true, status: true },
    });
    if (!targetUser || targetUser.status !== "active") {
      return c.json({ error: "USER_NOT_FOUND", message: t("subscriptions.userNotFound") }, 404);
    }

    // Validate category
    const category = await prisma.announcementCategory.findUnique({
      where: { id: body.categoryId },
    });
    if (!category) {
      return c.json({ error: "CATEGORY_NOT_FOUND", message: t("subscriptions.categoryNotFound") }, 422 as never);
    }
    if (category.isActive !== 1) {
      return c.json({ error: "CATEGORY_INACTIVE", message: t("subscriptions.categoryInactive") }, 422 as never);
    }

    // SMS check
    if (body.channels.includes("sms") && !targetUser.phone) {
      return c.json({ error: "NO_PHONE", message: t("subscriptions.noPhone") }, 422 as never);
    }

    const canReadPii = auth.permissions.includes("subscription:read_pii");
    const createdSubs = [];

    for (const channel of body.channels) {
      // Check existing
      const existing = await prisma.categorySubscription.findUnique({
        where: {
          userId_categoryId_channel: {
            userId: body.userId,
            categoryId: body.categoryId,
            channel,
          },
        },
      });

      if (existing) {
        if (existing.status === "confirmed") {
          return c.json({
            error: "ALREADY_SUBSCRIBED",
            message: t("subscriptions.alreadySubscribed", { categoryName: category.name, channel }),
          }, 409);
        }
        // Delete expired/declined to replace
        if (existing.status !== "pending") {
          await prisma.categorySubscription.delete({ where: { id: existing.id } });
        } else {
          // Pending: skip, already waiting for confirmation
          continue;
        }
      }

      const { token: _token, tokenHash } = await generateConfirmationToken(c.env.SUBSCRIPTION_HMAC_SECRET);
      const expiresAt = getExpirationDate(channel as "email" | "sms");

      const sub = await prisma.categorySubscription.create({
        data: {
          userId: body.userId,
          categoryId: body.categoryId,
          channel,
          status: "pending",
          confirmationTokenHash: tokenHash,
          expiresAt,
          subscribedById: auth.user.id,
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
          subscribedBy: { select: { id: true, name: true } },
        },
      });

      await createAuditLog(prisma, {
        actorId: auth.user.id,
        subjectId: body.userId,
        action: "subscription:create",
        resource: "subscription",
        details: { subscriptionId: sub.id, categoryId: body.categoryId, channel },
      });

      createdSubs.push(formatAdminSubscription(sub, canReadPii));
    }

    return c.json({
      subscriptions: createdSubs,
      message: t("subscriptions.created"),
    }, 201);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin resend (MUST be before parameterized /:id routes)
adminSubscriptionsApp.openapi(adminResendRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("subscription:manage")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const sub = await prisma.categorySubscription.findUnique({ where: { id } });
    if (!sub) {
      return c.json({ error: "NOT_FOUND", message: t("subscriptions.notFound") }, 404);
    }
    if (sub.status !== "pending") {
      return c.json({ error: "NOT_PENDING", message: t("subscriptions.notFound") }, 404);
    }

    const allowed = await checkResendRateLimit(prisma, id);
    if (!allowed) {
      return c.json({
        error: "RESEND_RATE_LIMITED",
        message: t("subscriptions.resendRateLimited", { channel: sub.channel }),
      }, 429);
    }

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

// Admin delete subscription
adminSubscriptionsApp.openapi(adminDeleteSubscriptionRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("subscription:manage")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const sub = await prisma.categorySubscription.findUnique({ where: { id } });
    if (!sub) {
      return c.json({ error: "NOT_FOUND", message: t("subscriptions.notFound") }, 404);
    }

    await prisma.categorySubscription.delete({ where: { id } });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      subjectId: sub.userId,
      action: "subscription:delete",
      resource: "subscription",
      details: { subscriptionId: id, channel: sub.channel },
    });

    return c.json({ message: t("subscriptions.deleted") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
