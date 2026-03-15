/**
 * Notification endpoints:
 * GET /v1/notifications — list user's notifications
 * PATCH /v1/notifications/:id/read — mark single as read
 * POST /v1/notifications/mark-all-read — mark all as read
 * GET /v1/notifications/preferences — get notification preferences
 * PATCH /v1/notifications/preferences — update notification preference
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";

type Bindings = { DB: D1Database; ALLOWED_ORIGIN: string };

export const notificationsApp = new OpenAPIHono<{ Bindings: Bindings; Variables: { auth: AuthContext } }>();

// --- Schemas ---

const NotificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  actorId: z.string().nullable(),
  resourceType: z.string(),
  resourceId: z.string(),
  actionUrl: z.string().nullable(),
  metadata: z.unknown().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

const NotificationListResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
  unreadCount: z.number(),
});

const PreferenceSchema = z.object({
  channel: z.string(),
  enabled: z.boolean(),
});

// --- Routes ---

const listRoute = createRoute({
  method: "get",
  path: "/v1/notifications",
  summary: "List user notifications",
  middleware: [authMiddleware()],
  request: {
    query: z.object({
      unreadOnly: z.string().optional(),
    }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: NotificationListResponseSchema } },
      description: "User notifications",
    },
  },
});

const markReadRoute = createRoute({
  method: "patch",
  path: "/v1/notifications/{id}/read",
  summary: "Mark notification as read",
  middleware: [authMiddleware()],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
      description: "Marked as read",
    },
    404: {
      content: { "application/json": { schema: z.object({ error: z.string(), message: z.string() }) } },
      description: "Not found",
    },
  },
});

const markAllReadRoute = createRoute({
  method: "post",
  path: "/v1/notifications/mark-all-read",
  summary: "Mark all notifications as read",
  middleware: [authMiddleware()],
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ message: z.string(), count: z.number() }) } },
      description: "All marked as read",
    },
  },
});

const getPreferencesRoute = createRoute({
  method: "get",
  path: "/v1/notifications/preferences",
  summary: "Get notification preferences",
  middleware: [authMiddleware()],
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ preferences: z.array(PreferenceSchema) }) } },
      description: "Notification preferences",
    },
  },
});

const updatePreferenceRoute = createRoute({
  method: "patch",
  path: "/v1/notifications/preferences",
  summary: "Update notification preference",
  middleware: [authMiddleware()],
  request: {
    body: { content: { "application/json": { schema: PreferenceSchema } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
      description: "Preference updated",
    },
    400: {
      content: { "application/json": { schema: z.object({ error: z.string(), message: z.string() }) } },
      description: "Invalid request",
    },
  },
});

// --- Handlers ---

notificationsApp.openapi(listRoute, async (c) => {
  const userId = c.get("auth")?.user?.id;
  if (!userId) return c.json({ notifications: [], unreadCount: 0 }, 200);

  const unreadOnly = c.req.query("unreadOnly") === "true";
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const where: Record<string, unknown> = { userId };
    if (unreadOnly) where.readAt = null;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    return c.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        actorId: n.actorId,
        resourceType: n.resourceType,
        resourceId: n.resourceId,
        actionUrl: n.actionUrl,
        metadata: n.metadata ? JSON.parse(n.metadata) : null,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

notificationsApp.openapi(markReadRoute, async (c) => {
  const userId = c.get("auth")?.user?.id;
  const { id } = c.req.param();

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      return c.json({ error: "not_found", message: "Notification not found" }, 404);
    }

    if (!notification.readAt) {
      await prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });
    }

    return c.json({ message: "Notification marked as read" }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

notificationsApp.openapi(markAllReadRoute, async (c) => {
  const userId = c.get("auth")?.user?.id;
  if (!userId) return c.json({ message: "All notifications marked as read", count: 0 }, 200);

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return c.json({
      message: "All notifications marked as read",
      count: result.count,
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

notificationsApp.openapi(getPreferencesRoute, async (c) => {
  const userId = c.get("auth")?.user?.id;
  if (!userId) return c.json({ preferences: [] }, 200);

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const preferences = await prisma.notificationPreference.findMany({
      where: { userId },
    });

    return c.json({
      preferences: preferences.map((p) => ({
        channel: p.channel,
        enabled: p.enabled,
      })),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

notificationsApp.openapi(updatePreferenceRoute, async (c) => {
  const userId = c.get("auth")?.user?.id;
  if (!userId) return c.json({ message: "Preference updated" }, 200);

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "bad_request", message: "Invalid JSON" }, 400);
  }
  const parsed = PreferenceSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "bad_request", message: "Invalid preference payload" }, 400);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    await prisma.notificationPreference.upsert({
      where: { userId_channel: { userId, channel: parsed.data.channel } },
      update: { enabled: parsed.data.enabled },
      create: {
        userId,
        channel: parsed.data.channel,
        enabled: parsed.data.enabled,
      },
    });

    return c.json({ message: "Preference updated" }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
