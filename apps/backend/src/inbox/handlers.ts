/**
 * Inbox API endpoints:
 * - GET /v1/inbox — paginated inbox items with filters
 * - PATCH /v1/inbox/:id — mark read/dismissed
 * - POST /v1/inbox/mark-all-read — bulk mark read
 *
 * @see Issue #397
 */

import { Hono } from "hono";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { createPrismaClient } from "../lib/prisma.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
};

type Variables = { auth: AuthContext };

export const inboxApp = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// --- Auth middleware ---
inboxApp.use("/v1/inbox", authMiddleware());
inboxApp.use("/v1/inbox/*", authMiddleware());

// --- GET /v1/inbox ---
inboxApp.get("/v1/inbox", async (c) => {
  const auth = c.get("auth") as AuthContext;
  const url = new URL(c.req.url);

  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "25", 10) || 25, 1), 100);
  const cursor = url.searchParams.get("cursor");
  const typeFilter = url.searchParams.get("type");
  const workspaceFilter = url.searchParams.get("workspace");
  const readFilter = url.searchParams.get("read");
  const actionableFilter = url.searchParams.get("actionable");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const dismissedFilter = url.searchParams.get("dismissed");

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Build where clause
    const where: Record<string, unknown> = {
      userId: auth.user.id,
    };

    // By default exclude dismissed
    if (dismissedFilter === "true") {
      where.dismissed = true;
    } else {
      where.dismissed = false;
    }

    if (typeFilter) where.type = typeFilter;
    if (workspaceFilter) where.workspace = workspaceFilter;
    if (readFilter === "true") where.readAt = { not: null };
    if (readFilter === "false") where.readAt = null;
    if (actionableFilter === "true") where.actionable = true;
    if (actionableFilter === "false") where.actionable = false;

    if (dateFrom || dateTo) {
      const createdAtFilter: Record<string, Date> = {};
      if (dateFrom) createdAtFilter.gte = new Date(dateFrom);
      if (dateTo) createdAtFilter.lte = new Date(dateTo);
      where.createdAt = createdAtFilter;
    }

    if (cursor) {
      where.id = { lt: cursor };
    }

    // Fetch items
    const items = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1, // fetch one extra for cursor
    });

    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;
    const lastItem = resultItems[resultItems.length - 1];
    const nextCursor = hasMore && lastItem ? lastItem.id : null;

    // Count unread and actionable
    const [unreadCount, actionableCount] = await Promise.all([
      prisma.notification.count({
        where: { userId: auth.user.id, readAt: null, dismissed: false },
      }),
      prisma.notification.count({
        where: { userId: auth.user.id, actionable: true, dismissed: false },
      }),
    ]);

    return c.json({
      items: resultItems.map((n) => ({
        id: n.id,
        type: n.type,
        summary: n.summary,
        workspace: n.workspace,
        sourceUrl: n.actionUrl,
        priority: n.priority,
        read: n.readAt !== null,
        readAt: n.readAt?.toISOString() ?? null,
        dismissed: n.dismissed,
        actionable: n.actionable,
        createdAt: n.createdAt.toISOString(),
      })),
      totalUnread: unreadCount,
      totalActionable: actionableCount,
      nextCursor,
    });
  } finally {
    await prisma.$disconnect();
  }
});

// --- PATCH /v1/inbox/:id ---
inboxApp.patch("/v1/inbox/:id", async (c) => {
  const auth = c.get("auth") as AuthContext;
  const itemId = c.req.param("id");
  const body = await c.req.json();

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Find the item, ensuring it belongs to this user
    const existing = await prisma.notification.findFirst({
      where: { id: itemId, userId: auth.user.id },
    });

    if (!existing) {
      return c.json({ error: "not_found", message: "Item not found" }, 404);
    }

    const updateData: Record<string, unknown> = {};
    if (body.read === true) {
      updateData.readAt = new Date();
    } else if (body.read === false) {
      updateData.readAt = null;
    }
    if (body.dismissed !== undefined) {
      updateData.dismissed = body.dismissed;
    }

    const updated = await prisma.notification.update({
      where: { id: itemId },
      data: updateData,
    });

    return c.json({
      id: updated.id,
      read: updated.readAt !== null,
      readAt: updated.readAt?.toISOString() ?? null,
      dismissed: updated.dismissed,
    });
  } finally {
    await prisma.$disconnect();
  }
});

// --- POST /v1/inbox/mark-all-read ---
inboxApp.post("/v1/inbox/mark-all-read", async (c) => {
  const auth = c.get("auth") as AuthContext;
  const body = await c.req.json().catch(() => ({}));

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const where: Record<string, unknown> = {
      userId: auth.user.id,
      readAt: null,
      dismissed: false,
    };

    if (body.type) where.type = body.type;
    if (body.workspace) where.workspace = body.workspace;

    const result = await prisma.notification.updateMany({
      where,
      data: { readAt: new Date() },
    });

    return c.json({ updated: result.count });
  } finally {
    await prisma.$disconnect();
  }
});
