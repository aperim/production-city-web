/**
 * GET /v1/home/summary — returns home dashboard data for authenticated user.
 *
 * Response: { attention, workspaceStats, whatsNew }
 * Caching: private, max-age=60, Vary: Cookie
 * Auth: required (session cookie)
 *
 * @see Issue #395
 */

import { Hono } from "hono";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { resolveDashboardRole } from "../lib/permissions.js";
import { computeVisibleWorkspaces } from "../lib/workspace-resolver.js";
import { createPrismaClient } from "../lib/prisma.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
  COMPANY_PHASE?: string;
};

type Variables = { auth: AuthContext };

export const homeSummaryApp = new Hono<{ Bindings: Bindings; Variables: Variables }>();

homeSummaryApp.use("/v1/home/summary", authMiddleware());

homeSummaryApp.get("/v1/home/summary", async (c) => {
  const auth = c.get("auth") as AuthContext;
  const dashboardRole = resolveDashboardRole(auth.permissions);
  const visibleWorkspaces = computeVisibleWorkspaces(dashboardRole, auth.permissions);
  const visibleWorkspaceIds = new Set(visibleWorkspaces.map((ws) => ws.id));

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Fetch attention items (unread, undismissed, limited to 5)
    const allNotifications = await prisma.notification.findMany({
      where: {
        userId: auth.user.id,
        dismissed: false,
        readAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Filter to visible workspaces (null workspace = system notification, always visible)
    const filteredNotifications = allNotifications.filter(
      (n) => n.workspace === null || visibleWorkspaceIds.has(n.workspace),
    );

    const attentionItems = filteredNotifications.slice(0, 5).map((n) => ({
      id: n.id,
      type: n.type,
      summary: n.summary,
      workspace: n.workspace,
      sourceUrl: n.actionUrl,
      priority: n.priority,
      createdAt: n.createdAt.toISOString(),
    }));

    // Build workspace stats (placeholder stats per visible workspace)
    const workspaceStats: Record<string, { stats: Array<{ label: string; value: string }> }> = {};
    for (const ws of visibleWorkspaces) {
      workspaceStats[ws.id] = {
        stats: [
          { label: "Active features", value: String(ws.activeFeatures) },
          { label: "Total features", value: String(ws.totalFeatures) },
        ],
      };
    }

    // What's New: features activated in last 30 days
    // Placeholder: no runtime feature activation tracking yet.
    // Will be populated when feature activation timestamps are stored.
    const whatsNew: Array<{ featureId: string; label: string; workspace: string; activatedAt: string }> = [];

    c.header("Cache-Control", "private, max-age=60");
    c.header("Vary", "Cookie");

    return c.json({
      attention: {
        total: filteredNotifications.length,
        items: attentionItems,
      },
      workspaceStats,
      whatsNew,
    });
  } finally {
    await prisma.$disconnect();
  }
});
