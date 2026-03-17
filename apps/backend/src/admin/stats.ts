/**
 * Admin dashboard stats: GET /v1/admin/stats
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware, requirePermission } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";

type Bindings = { DB: D1Database };

export const statsApp = new OpenAPIHono<{ Bindings: Bindings; Variables: { auth: AuthContext } }>();

statsApp.use("/v1/admin/stats", authMiddleware());
statsApp.use("/v1/admin/stats", requirePermission("user", "read"));

const AdminStatsSchema = z.object({
  totalUsers: z.number(),
  pendingApprovals: z.number(),
  activeInvitations: z.number(),
});

const statsRoute = createRoute({
  method: "get",
  path: "/v1/admin/stats",
  summary: "Get admin dashboard statistics",
  responses: {
    200: {
      content: { "application/json": { schema: AdminStatsSchema } },
      description: "Dashboard stats",
    },
  },
});

statsApp.openapi(statsRoute, async (c) => {
  const prisma = await createPrismaClient(c.env.DB);

  try {
    const [totalUsers, pendingApprovals, activeInvitations] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "pending_approval" } }),
      prisma.invitation.count({
        where: { status: "pending", expiresAt: { gt: new Date() } },
      }),
    ]);

    return c.json({ totalUsers, pendingApprovals, activeInvitations }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
