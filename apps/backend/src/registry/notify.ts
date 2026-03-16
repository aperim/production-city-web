/**
 * Feature notification ("Notify Me") API endpoints.
 *
 * POST   /v1/features/:featureId/notify — subscribe
 * DELETE /v1/features/:featureId/notify — unsubscribe
 * GET    /v1/features/:featureId/notify — check subscription status
 *
 * Security:
 * - Auth required (session cookie)
 * - CSRF enforced via existing csrfMiddleware on /v1/*
 * - featureId validated against registry
 * - Anti-enumeration: unauthorized/invalid features return 404 (not 403)
 * - Visibility check: user must have access to the feature to subscribe
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { createPrismaClient } from "../lib/prisma.js";
import { isValidFeatureId, computeVisibleFeatures, resolveDashboardRole } from "../lib/permissions.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
};

export const featureNotifyApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

// Auth on all notify endpoints
featureNotifyApp.use("/v1/features/:featureId/notify", authMiddleware());

/** Helper: check feature exists and user can see it. Returns true if allowed. */
function userCanAccessFeature(auth: AuthContext, featureId: string): boolean {
  if (!isValidFeatureId(featureId)) return false;

  const dashboardRole = resolveDashboardRole(auth.permissions);
  const visibleIds = computeVisibleFeatures(dashboardRole, auth.permissions);
  return visibleIds.includes(featureId);
}

// --- Subscribe ---

const subscribeRoute = createRoute({
  method: "post",
  path: "/v1/features/{featureId}/notify",
  summary: "Subscribe to feature launch notification",
  request: {
    params: z.object({ featureId: z.string() }),
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.string(),
            featureId: z.string(),
            createdAt: z.string(),
          }),
        },
      },
      description: "Subscribed",
    },
    404: {
      content: { "application/json": { schema: z.object({ error: z.string(), message: z.string() }) } },
      description: "Feature not found",
    },
  },
});

featureNotifyApp.openapi(subscribeRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const featureId = c.req.param("featureId");

  if (!userCanAccessFeature(auth, featureId)) {
    return c.json({ error: "not_found", message: "Feature not found" }, 404);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Atomic upsert — idempotent and race-safe
    const notification = await prisma.featureNotification.upsert({
      where: { userId_featureId: { userId: auth.user.id, featureId } },
      update: {},
      create: { userId: auth.user.id, featureId },
    });

    return c.json(
      {
        id: notification.id,
        featureId: notification.featureId,
        createdAt: notification.createdAt.toISOString(),
      },
      201,
    );
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// --- Unsubscribe ---

const unsubscribeRoute = createRoute({
  method: "delete",
  path: "/v1/features/{featureId}/notify",
  summary: "Unsubscribe from feature launch notification",
  request: {
    params: z.object({ featureId: z.string() }),
  },
  responses: {
    204: { description: "Unsubscribed" },
    404: {
      content: { "application/json": { schema: z.object({ error: z.string(), message: z.string() }) } },
      description: "Feature not found",
    },
  },
});

featureNotifyApp.openapi(unsubscribeRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const featureId = c.req.param("featureId");

  if (!userCanAccessFeature(auth, featureId)) {
    return c.json({ error: "not_found", message: "Feature not found" }, 404);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    await prisma.featureNotification.deleteMany({
      where: { userId: auth.user.id, featureId },
    });

    return c.body(null, 204);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// --- Check Subscription Status ---

const checkRoute = createRoute({
  method: "get",
  path: "/v1/features/{featureId}/notify",
  summary: "Check feature notification subscription status",
  request: {
    params: z.object({ featureId: z.string() }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            subscribed: z.boolean(),
            subscribedAt: z.string().nullable(),
          }),
        },
      },
      description: "Subscription status",
    },
  },
});

featureNotifyApp.openapi(checkRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  const featureId = c.req.param("featureId");

  // Anti-enumeration: return { subscribed: false } for both unsubscribed
  // AND nonexistent/unauthorized features
  if (!userCanAccessFeature(auth, featureId)) {
    return c.json({ subscribed: false, subscribedAt: null }, 200);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.featureNotification.findUnique({
      where: { userId_featureId: { userId: auth.user.id, featureId } },
    });

    if (existing) {
      return c.json(
        {
          subscribed: true,
          subscribedAt: existing.createdAt.toISOString(),
        },
        200,
      );
    }

    return c.json({ subscribed: false, subscribedAt: null }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
