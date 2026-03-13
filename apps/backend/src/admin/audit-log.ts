/**
 * Admin audit log:
 * GET /v1/admin/audit-log — cursor-based pagination
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware, requirePermission } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";

type Bindings = { DB: D1Database; ALLOWED_ORIGIN: string };

export const auditLogApp = new OpenAPIHono<{ Bindings: Bindings; Variables: { auth: AuthContext } }>();

/** --- Schemas --- */

const AuditLogQuerySchema = z.object({
  limit: z.string().optional().default("25"),
  cursor: z.string().optional(),
  action: z.string().optional(),
  actorId: z.string().optional(),
  subjectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const AuditLogEntrySchema = z.object({
  id: z.string(),
  actorId: z.string().nullable(),
  subjectId: z.string().nullable(),
  action: z.string(),
  resource: z.string(),
  details: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
});

const AuditLogResponseSchema = z.object({
  entries: z.array(AuditLogEntrySchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

/** --- Routes --- */

const listAuditLogRoute = createRoute({
  method: "get",
  path: "/v1/admin/audit-log",
  summary: "List audit log entries (cursor-based pagination)",
  request: { query: AuditLogQuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: AuditLogResponseSchema } },
      description: "Audit log entries",
    },
  },
});

/** --- Auth --- */
auditLogApp.use("/v1/admin/*", authMiddleware());
auditLogApp.use("/v1/admin/audit-log", requirePermission("audit", "read"));

/** --- Handlers --- */

auditLogApp.openapi(listAuditLogRoute, async (c) => {
  const query = c.req.valid("query");
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 25));

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Build where clause
    const where: Record<string, unknown> = {};
    if (query.action) where.action = query.action;
    if (query.actorId) where.actorId = query.actorId;
    if (query.subjectId) where.subjectId = query.subjectId;

    if (query.startDate || query.endDate) {
      const createdAt: Record<string, Date> = {};
      if (query.startDate) createdAt.gte = new Date(query.startDate);
      if (query.endDate) createdAt.lte = new Date(query.endDate);
      where.createdAt = createdAt;
    }

    // Cursor-based pagination using createdAt + id
    if (query.cursor) {
      // Cursor format: "createdAt|id"
      const parts = query.cursor.split("|");
      if (parts.length === 2) {
        const cursorDate = new Date(parts[0]!);
        const cursorId = parts[1]!;
        where.OR = [
          { createdAt: { lt: cursorDate } },
          { createdAt: cursorDate, id: { lt: cursorId } },
        ];
      }
    }

    const entries = await prisma.auditLog.findMany({
      where,
      take: limit + 1, // Fetch one extra to determine hasMore
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        actorId: true,
        subjectId: true,
        action: true,
        resource: true,
        details: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    const hasMore = entries.length > limit;
    const items = hasMore ? entries.slice(0, limit) : entries;
    const lastItem = items[items.length - 1];
    const nextCursor = hasMore && lastItem
      ? `${lastItem.createdAt.toISOString()}|${lastItem.id}`
      : null;

    return c.json({
      entries: items.map((e) => ({
        id: e.id,
        actorId: e.actorId,
        subjectId: e.subjectId,
        action: e.action,
        resource: e.resource,
        details: e.details,
        ipAddress: e.ipAddress,
        createdAt: e.createdAt.toISOString(),
      })),
      nextCursor,
      hasMore,
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
