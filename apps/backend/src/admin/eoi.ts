/**
 * Admin EOI management handlers:
 * GET /v1/admin/eoi — list with pagination, filtering, search
 * GET /v1/admin/eoi/:id — detail
 * PATCH /v1/admin/eoi/:id — update status
 * GET /v1/admin/eoi/stats — aggregate stats
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware, requirePermission } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { createAuditLog } from "../auth/audit.js";
import { t } from "../i18n/index.js";
import { EOI_STATUSES, EoiAdminListQuerySchema, EoiStatusUpdateSchema } from "../eoi/validation.js";

type Bindings = { DB: D1Database; ALLOWED_ORIGIN: string };

export const eoiAdminApp = new OpenAPIHono<{ Bindings: Bindings; Variables: { auth: AuthContext } }>();

// --- Schemas ---

const EoiDetailSchema = z.object({
  id: z.string(),
  category: z.string(),
  status: z.string(),
  locale: z.string(),
  name: z.string(),
  email: z.string(),
  message: z.string().nullable(),
  metadata: z.unknown().nullable(),
  sourcePage: z.string(),
  sourceCategory: z.string().nullable(),
  utmSource: z.string().nullable(),
  utmMedium: z.string().nullable(),
  utmCampaign: z.string().nullable(),
  consentVersion: z.string(),
  privacyAcceptedAt: z.string(),
  marketingOptIn: z.boolean(),
  confirmationSentAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable(),
});

const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

const EoiListResponseSchema = z.object({
  data: z.array(EoiDetailSchema),
  pagination: PaginationSchema,
});

const StatsResponseSchema = z.object({
  byCategory: z.record(z.string(), z.number()),
  byStatus: z.record(z.string(), z.number()),
  byLocale: z.record(z.string(), z.number()),
  total: z.number(),
});

// --- Routes ---

const listRoute = createRoute({
  method: "get",
  path: "/v1/admin/eoi",
  summary: "List EOI submissions",
  middleware: [authMiddleware(), requirePermission("audit", "read")],
  request: { query: EoiAdminListQuerySchema },
  responses: {
    200: {
      content: { "application/json": { schema: EoiListResponseSchema } },
      description: "EOI list",
    },
  },
});

const detailRoute = createRoute({
  method: "get",
  path: "/v1/admin/eoi/{id}",
  summary: "Get EOI detail",
  middleware: [authMiddleware(), requirePermission("audit", "read")],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: { "application/json": { schema: EoiDetailSchema } },
      description: "EOI detail",
    },
    404: {
      content: { "application/json": { schema: z.object({ error: z.string(), message: z.string() }) } },
      description: "Not found",
    },
  },
});

const updateStatusRoute = createRoute({
  method: "patch",
  path: "/v1/admin/eoi/{id}",
  summary: "Update EOI status",
  middleware: [authMiddleware(), requirePermission("audit", "write")],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: EoiStatusUpdateSchema } } },
  },
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
      description: "Status updated",
    },
    400: {
      content: { "application/json": { schema: z.object({ error: z.string(), message: z.string() }) } },
      description: "Validation error",
    },
    404: {
      content: { "application/json": { schema: z.object({ error: z.string(), message: z.string() }) } },
      description: "Not found",
    },
  },
});

const statsRoute = createRoute({
  method: "get",
  path: "/v1/admin/eoi/stats",
  summary: "EOI aggregate statistics",
  middleware: [authMiddleware(), requirePermission("audit", "read")],
  responses: {
    200: {
      content: { "application/json": { schema: StatsResponseSchema } },
      description: "EOI stats",
    },
  },
});

// --- Handlers ---

eoiAdminApp.openapi(listRoute, async (c) => {
  const query = EoiAdminListQuerySchema.parse(c.req.query());
  const page = Math.max(1, parseInt(query.page, 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10)));
  const skip = (page - 1) * limit;

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const where: Record<string, unknown> = {};
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;
    if (query.locale) where.locale = query.locale;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) (where.createdAt as Record<string, unknown>).gte = new Date(query.from);
      if (query.to) (where.createdAt as Record<string, unknown>).lte = new Date(query.to);
    }

    const [total, items] = await Promise.all([
      prisma.expressionOfInterest.count({ where }),
      prisma.expressionOfInterest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    const data = items.map((item) => ({
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata) : null,
      privacyAcceptedAt: item.privacyAcceptedAt.toISOString(),
      confirmationSentAt: item.confirmationSentAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      archivedAt: item.archivedAt?.toISOString() ?? null,
    }));

    return c.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

eoiAdminApp.openapi(detailRoute, async (c) => {
  const { id } = c.req.param();
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const item = await prisma.expressionOfInterest.findUnique({ where: { id } });
    if (!item) {
      return c.json({ error: "not_found", message: t("eoi.admin.notFound") }, 404);
    }
    return c.json({
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata) : null,
      privacyAcceptedAt: item.privacyAcceptedAt.toISOString(),
      confirmationSentAt: item.confirmationSentAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      archivedAt: item.archivedAt?.toISOString() ?? null,
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

eoiAdminApp.openapi(updateStatusRoute, async (c) => {
  const { id } = c.req.param();
  const body = EoiStatusUpdateSchema.safeParse(await c.req.json());
  if (!body.success) {
    return c.json({
      error: "validation_error",
      message: t("eoi.admin.invalidStatus", { allowed: EOI_STATUSES.join(", ") }),
    }, 400);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.expressionOfInterest.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "not_found", message: t("eoi.admin.notFound") }, 404);
    }

    const updateData: Record<string, unknown> = { status: body.data.status };
    if (body.data.status === "archived") {
      updateData.archivedAt = new Date();
      updateData.archivedBy = c.get("auth")?.user?.id ?? null;
    }

    await prisma.expressionOfInterest.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await createAuditLog(prisma, {
      actorId: c.get("auth")?.user?.id ?? null,
      action: "eoi_status_update",
      resource: "expression_of_interest",
      subjectId: null,
      details: {
        eoiId: id,
        previousStatus: existing.status,
        newStatus: body.data.status,
      },
      ipAddress: c.req.header("cf-connecting-ip") ?? null,
      userAgent: c.req.header("user-agent") ?? null,
    });

    return c.json({ message: t("eoi.admin.updated") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

eoiAdminApp.openapi(statsRoute, async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const all = await prisma.expressionOfInterest.findMany({
      select: { category: true, status: true, locale: true },
    });

    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byLocale: Record<string, number> = {};

    for (const item of all) {
      byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
      byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
      byLocale[item.locale] = (byLocale[item.locale] ?? 0) + 1;
    }

    return c.json({
      byCategory,
      byStatus,
      byLocale,
      total: all.length,
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
