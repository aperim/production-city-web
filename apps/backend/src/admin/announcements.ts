/**
 * Announcement CRUD, Publishing & Visibility API:
 *
 * Admin endpoints (require announcement:read_admin or higher):
 * GET    /v1/admin/announcements              — list all announcements
 * POST   /v1/admin/announcements              — create draft
 * GET    /v1/admin/announcements/:id           — get by ID
 * PATCH  /v1/admin/announcements/:id           — update
 * POST   /v1/admin/announcements/:id/publish   — publish
 * POST   /v1/admin/announcements/:id/unpublish — revert to draft
 * POST   /v1/admin/announcements/:id/archive   — archive
 *
 * Public endpoints (optional auth for visibility filtering):
 * GET    /v1/announcements                     — list published (visibility-filtered)
 * GET    /v1/announcements/:slug               — get by slug (visibility-filtered)
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware, optionalAuthMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { createAuditLog } from "../auth/audit.js";
import { t } from "../i18n/index.js";
import { generateUniqueSlug } from "../lib/slug.js";
import { ContentBlocksSchema, isSafeText } from "../lib/content-blocks.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.js";

type Bindings = { DB: D1Database; ALLOWED_ORIGIN: string };

export const announcementsApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

// --- CRLF stripping for email header injection prevention ---
function stripCRLF(s: string): string {
  return s.replace(/[\r\n]/g, " ").trim();
}

// --- Schemas ---

const AnnouncementPublicSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  contentBlocks: z.any(),
  visibility: z.string(),
  categories: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })),
  tags: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })),
  author: z.object({ id: z.string(), name: z.string().nullable() }),
  publishedAt: z.string().nullable(),
  lastEditedAt: z.string().nullable(),
});

const AnnouncementAdminSchema = AnnouncementPublicSchema.extend({
  status: z.string(),
  roleVisibility: z.array(z.object({ id: z.string(), name: z.string() })),
  deliveryStats: z.object({
    queued: z.number(),
    sent: z.number(),
    delivered: z.number(),
    opened: z.number(),
    failed: z.number(),
    suppressed: z.number(),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PaginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

const CreateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  contentBlocks: ContentBlocksSchema,
  visibility: z.enum(["public", "private"]),
  categoryIds: z.array(z.string()).min(1),
  tagIds: z.array(z.string()).optional().default([]),
  roleIds: z.array(z.string()).optional().default([]),
});

const UpdateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().min(1).max(500).optional(),
  contentBlocks: ContentBlocksSchema.optional(),
  visibility: z.enum(["public", "private"]).optional(),
  categoryIds: z.array(z.string()).min(1).optional(),
  tagIds: z.array(z.string()).optional(),
  roleIds: z.array(z.string()).optional(),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

// --- Rate limiting for public endpoints ---

const publicListRateLimit = rateLimitMiddleware({
  keyFn: (c) => c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown",
  limit: 60,
  windowSeconds: 60,
});

const publicDetailRateLimit = rateLimitMiddleware({
  keyFn: (c) => c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown",
  limit: 120,
  windowSeconds: 60,
});

// --- Route definitions ---

const adminListRoute = createRoute({
  method: "get",
  path: "/v1/admin/announcements",
  summary: "List all announcements (admin)",
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ announcements: z.array(AnnouncementAdminSchema), pagination: PaginationSchema }) } },
      description: "Announcements",
    },
  },
});

const adminCreateRoute = createRoute({
  method: "post",
  path: "/v1/admin/announcements",
  summary: "Create draft announcement",
  request: {
    body: { content: { "application/json": { schema: CreateAnnouncementSchema } } },
  },
  responses: {
    201: { content: { "application/json": { schema: AnnouncementAdminSchema } }, description: "Created" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Bad request" },
  },
});

const adminGetRoute = createRoute({
  method: "get",
  path: "/v1/admin/announcements/{id}",
  summary: "Get announcement by ID (admin)",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: AnnouncementAdminSchema } }, description: "Announcement" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const adminUpdateRoute = createRoute({
  method: "patch",
  path: "/v1/admin/announcements/{id}",
  summary: "Update announcement",
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: UpdateAnnouncementSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: AnnouncementAdminSchema.extend({ warnings: z.array(z.string()).optional() }) } }, description: "Updated" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Bad request" },
  },
});

const publishRoute = createRoute({
  method: "post",
  path: "/v1/admin/announcements/{id}/publish",
  summary: "Publish announcement",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string(), deliverySummary: z.object({ totalSubscribers: z.number(), deliveryCount: z.number(), suppressedCount: z.number() }).optional() }) } }, description: "Published" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Conflict" },
  },
});

const unpublishRoute = createRoute({
  method: "post",
  path: "/v1/admin/announcements/{id}/unpublish",
  summary: "Revert announcement to draft",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string(), warnings: z.array(z.string()).optional() }) } }, description: "Unpublished" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Bad request" },
  },
});

const archiveRoute = createRoute({
  method: "post",
  path: "/v1/admin/announcements/{id}/archive",
  summary: "Archive announcement",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Archived" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const publicListRoute = createRoute({
  method: "get",
  path: "/v1/announcements",
  summary: "List published announcements (public)",
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ announcements: z.array(AnnouncementPublicSchema), pagination: PaginationSchema }) } },
      description: "Announcements",
    },
  },
});

const publicGetRoute = createRoute({
  method: "get",
  path: "/v1/announcements/{slug}",
  summary: "Get published announcement by slug (public)",
  request: { params: z.object({ slug: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: AnnouncementPublicSchema } }, description: "Announcement" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

// --- Auth middleware ---

announcementsApp.use("/v1/admin/announcements", authMiddleware());
announcementsApp.use("/v1/admin/announcements/*", authMiddleware());

// --- Optional auth + rate limiting on public endpoints ---

announcementsApp.use("/v1/announcements", optionalAuthMiddleware(), publicListRateLimit);
announcementsApp.use("/v1/announcements/*", optionalAuthMiddleware(), publicDetailRateLimit);

// --- Helper: format announcement for admin response ---

interface AnnouncementWithRelations {
  id: string;
  title: string;
  slug: string;
  summary: string;
  contentBlocks: string;
  visibility: string;
  status: string;
  publishedAt: Date | null;
  lastEditedAt: Date | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string | null };
  categoryLinks: Array<{ category: { id: string; name: string; slug: string } }>;
  tagLinks: Array<{ tag: { id: string; name: string; slug: string } }>;
  roleVisibility: Array<{ role: { id: string; name: string } }>;
}

function formatAdminResponse(ann: AnnouncementWithRelations, deliveryStats?: Record<string, number>) {
  return {
    id: ann.id,
    title: ann.title,
    slug: ann.slug,
    summary: ann.summary,
    contentBlocks: JSON.parse(ann.contentBlocks),
    visibility: ann.visibility,
    status: ann.status,
    categories: ann.categoryLinks.map((cl) => cl.category),
    tags: ann.tagLinks.map((tl) => tl.tag),
    author: { id: ann.author.id, name: ann.author.name },
    roleVisibility: ann.roleVisibility.map((rv) => rv.role),
    deliveryStats: deliveryStats ?? { queued: 0, sent: 0, delivered: 0, opened: 0, failed: 0, suppressed: 0 },
    publishedAt: ann.publishedAt?.toISOString() ?? null,
    lastEditedAt: ann.lastEditedAt?.toISOString() ?? null,
    createdAt: ann.createdAt.toISOString(),
    updatedAt: ann.updatedAt.toISOString(),
  };
}

const announcementInclude = {
  author: { select: { id: true, name: true } },
  categoryLinks: { include: { category: { select: { id: true, name: true, slug: true } } } },
  tagLinks: { include: { tag: { select: { id: true, name: true, slug: true } } } },
  roleVisibility: { include: { role: { select: { id: true, name: true } } } },
};

// Helper: get delivery stats for an announcement
async function getDeliveryStats(prisma: ReturnType<typeof createPrismaClient> extends Promise<infer T> ? T : never, announcementId: string) {
  const deliveries = await prisma.announcementDelivery.groupBy({
    by: ["status"],
    where: { announcementId },
    _count: true,
  });
  const stats: Record<string, number> = { queued: 0, sent: 0, delivered: 0, opened: 0, failed: 0, suppressed: 0 };
  for (const d of deliveries) {
    stats[d.status] = d._count;
  }
  return stats;
}

// --- Admin Handlers ---

// Admin: List all announcements
// @ts-expect-error — handler returns 403 which is not in route definition
announcementsApp.openapi(adminListRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("announcement:read_admin")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const url = new URL(c.req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10) || 20));
  const status = url.searchParams.get("status");
  const visibility = url.searchParams.get("visibility");
  const categorySlug = url.searchParams.get("category");
  const tagSlug = url.searchParams.get("tag");
  const authorId = url.searchParams.get("author");
  const search = url.searchParams.get("search")?.slice(0, 200);
  const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") ?? "desc";

  const allowedSortBy = ["createdAt", "updatedAt", "publishedAt", "title"];
  const allowedSortOrder = ["asc", "desc"];
  if (!allowedSortBy.includes(sortBy) || !allowedSortOrder.includes(sortOrder)) {
    return c.json({ error: "INVALID_SORT", message: "Invalid sort parameters" }, 400 as never);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;
    if (authorId) where.authorId = authorId;
    if (categorySlug) {
      where.categoryLinks = { some: { category: { slug: categorySlug } } };
    }
    if (tagSlug) {
      where.tagLinks = { some: { tag: { slug: tagSlug } } };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: announcementInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.announcement.count({ where }),
    ]);

    const formatted = await Promise.all(
      announcements.map(async (ann) => {
        const stats = ann.status === "published" ? await getDeliveryStats(prisma, ann.id) : undefined;
        return formatAdminResponse(ann as unknown as AnnouncementWithRelations, stats);
      }),
    );

    return c.json({
      announcements: formatted,
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

// Admin: Create draft announcement
// @ts-expect-error — handler returns 403 which is not in route definition
announcementsApp.openapi(adminCreateRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("announcement:create")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const body = c.req.valid("json");

  // Strip CRLF from title and summary
  const title = stripCRLF(body.title);
  const summary = stripCRLF(body.summary);

  // XSS check on title and summary
  if (!isSafeText(title) || !isSafeText(summary)) {
    return c.json({ error: "VALIDATION_ERROR", message: t("announcements.invalidContentBlocks") }, 400);
  }

  // Validate visibility + roleIds consistency
  if (body.visibility === "private" && (!body.roleIds || body.roleIds.length === 0)) {
    return c.json({ error: "VALIDATION_ERROR", message: t("announcements.privateNeedsRoles") }, 400);
  }
  if (body.visibility === "public" && body.roleIds && body.roleIds.length > 0) {
    return c.json({ error: "VALIDATION_ERROR", message: "Public announcements must not have role restrictions" }, 400);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Validate categoryIds exist and are active
    const categories = await prisma.announcementCategory.findMany({
      where: { id: { in: body.categoryIds }, isActive: 1 },
      select: { id: true },
    });
    if (categories.length !== body.categoryIds.length) {
      return c.json({ error: "VALIDATION_ERROR", message: t("announcements.missingCategories") }, 400);
    }

    // Validate tagIds if provided
    if (body.tagIds && body.tagIds.length > 0) {
      const tags = await prisma.announcementTag.findMany({
        where: { id: { in: body.tagIds } },
        select: { id: true },
      });
      if (tags.length !== body.tagIds.length) {
        return c.json({ error: "VALIDATION_ERROR", message: "One or more tags not found" }, 400);
      }
    }

    // Validate roleIds if provided
    if (body.roleIds && body.roleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: { id: { in: body.roleIds } },
        select: { id: true },
      });
      if (roles.length !== body.roleIds.length) {
        return c.json({ error: "VALIDATION_ERROR", message: "One or more roles not found" }, 400);
      }
    }

    // Validate media asset references in content blocks
    const mediaAssetIds = body.contentBlocks
      .filter((b: Record<string, unknown>) => "mediaAssetId" in b)
      .map((b: Record<string, unknown>) => b.mediaAssetId as string);
    if (mediaAssetIds.length > 0) {
      const assets = await prisma.mediaAsset.findMany({
        where: { id: { in: mediaAssetIds }, archivedAt: null },
        select: { id: true },
      });
      if (assets.length !== mediaAssetIds.length) {
        return c.json({ error: "VALIDATION_ERROR", message: t("announcements.mediaNotFound") }, 400);
      }
    }

    // Generate slug
    const slug = await generateUniqueSlug(title, async (s) => {
      const found = await prisma.announcement.findUnique({ where: { slug: s } });
      return found !== null;
    });

    // Create announcement with relations
    const ann = await prisma.announcement.create({
      data: {
        title,
        slug,
        summary,
        contentBlocks: JSON.stringify(body.contentBlocks),
        visibility: body.visibility,
        authorId: auth.user.id,
        categoryLinks: {
          create: body.categoryIds.map((categoryId) => ({ categoryId })),
        },
        tagLinks: {
          create: (body.tagIds ?? []).map((tagId) => ({ tagId })),
        },
        roleVisibility: {
          create: (body.roleIds ?? []).map((roleId) => ({ roleId })),
        },
      },
      include: announcementInclude,
    });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "create",
      resource: "announcement",
      details: { announcementId: ann.id, title: ann.title },
    });

    return c.json(formatAdminResponse(ann as unknown as AnnouncementWithRelations), 201);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Get announcement by ID
// @ts-expect-error — handler returns 403 which is not in route definition
announcementsApp.openapi(adminGetRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("announcement:read_admin")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const ann = await prisma.announcement.findUnique({
      where: { id },
      include: announcementInclude,
    });

    if (!ann) {
      return c.json({ error: "ANNOUNCEMENT_NOT_FOUND", message: t("announcements.notFound") }, 404);
    }

    const stats = ann.status === "published" ? await getDeliveryStats(prisma, ann.id) : undefined;
    return c.json(formatAdminResponse(ann as unknown as AnnouncementWithRelations, stats), 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Update announcement
// @ts-expect-error — handler returns 403 which is not in route definition
announcementsApp.openapi(adminUpdateRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("announcement:update")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.announcement.findUnique({
      where: { id },
      include: announcementInclude,
    });
    if (!existing) {
      return c.json({ error: "ANNOUNCEMENT_NOT_FOUND", message: t("announcements.notFound") }, 404);
    }
    if (existing.status === "archived") {
      return c.json({ error: "CANNOT_UPDATE_ARCHIVED", message: t("announcements.cannotUpdateArchived") }, 400);
    }

    // Validate visibility + roleIds consistency (including existing roles)
    const newVisibility = body.visibility ?? existing.visibility;
    const effectiveRoleIds = body.roleIds !== undefined
      ? body.roleIds
      : existing.roleVisibility.map((rv) => rv.roleId);
    if (newVisibility === "private" && effectiveRoleIds.length === 0) {
      return c.json({ error: "VALIDATION_ERROR", message: t("announcements.privateNeedsRoles") }, 400);
    }
    if (newVisibility === "public" && body.roleIds !== undefined && body.roleIds.length > 0) {
      return c.json({ error: "VALIDATION_ERROR", message: "Public announcements must not have role restrictions" }, 400);
    }

    // XSS check on title and summary
    if (body.title !== undefined && !isSafeText(stripCRLF(body.title))) {
      return c.json({ error: "VALIDATION_ERROR", message: t("announcements.invalidContentBlocks") }, 400);
    }
    if (body.summary !== undefined && !isSafeText(stripCRLF(body.summary))) {
      return c.json({ error: "VALIDATION_ERROR", message: t("announcements.invalidContentBlocks") }, 400);
    }

    // --- Validate ALL relations BEFORE making any writes ---

    // Validate categoryIds
    if (body.categoryIds !== undefined) {
      const categories = await prisma.announcementCategory.findMany({
        where: { id: { in: body.categoryIds }, isActive: 1 },
        select: { id: true },
      });
      if (categories.length !== body.categoryIds.length) {
        return c.json({ error: "VALIDATION_ERROR", message: t("announcements.missingCategories") }, 400);
      }
    }

    // Validate tagIds
    if (body.tagIds !== undefined && body.tagIds.length > 0) {
      const tags = await prisma.announcementTag.findMany({
        where: { id: { in: body.tagIds } },
        select: { id: true },
      });
      if (tags.length !== body.tagIds.length) {
        return c.json({ error: "VALIDATION_ERROR", message: "One or more tags not found" }, 400);
      }
    }

    // Validate roleIds
    if (body.roleIds !== undefined && body.roleIds.length > 0) {
      const roles = await prisma.role.findMany({
        where: { id: { in: body.roleIds } },
        select: { id: true },
      });
      if (roles.length !== body.roleIds.length) {
        return c.json({ error: "VALIDATION_ERROR", message: "One or more roles not found" }, 400);
      }
    }

    // Validate content block media references
    if (body.contentBlocks !== undefined) {
      const mediaAssetIds = body.contentBlocks
        .filter((b: Record<string, unknown>) => "mediaAssetId" in b)
        .map((b: Record<string, unknown>) => b.mediaAssetId as string);
      if (mediaAssetIds.length > 0) {
        const assets = await prisma.mediaAsset.findMany({
          where: { id: { in: mediaAssetIds }, archivedAt: null },
          select: { id: true },
        });
        if (assets.length !== mediaAssetIds.length) {
          return c.json({ error: "VALIDATION_ERROR", message: t("announcements.mediaNotFound") }, 400);
        }
      }
    }

    // --- All validation passed. Build update data and apply writes. ---

    const warnings: string[] = [];
    const updateData: Record<string, unknown> = {};

    // Title update with CRLF stripping
    if (body.title !== undefined) {
      updateData.title = stripCRLF(body.title);
      // Slug handling: only regenerate if draft
      if (existing.status === "draft") {
        updateData.slug = await generateUniqueSlug(stripCRLF(body.title), async (s) => {
          const found = await prisma.announcement.findUnique({ where: { slug: s } });
          return found !== null && found.id !== id;
        });
      } else {
        warnings.push(t("announcements.slugFrozenWarning"));
      }
    }

    if (body.summary !== undefined) {
      updateData.summary = stripCRLF(body.summary);
    }

    if (body.contentBlocks !== undefined) {
      updateData.contentBlocks = JSON.stringify(body.contentBlocks);
    }

    if (body.visibility !== undefined) {
      updateData.visibility = body.visibility;
    }

    // Track edit-after-publish
    if (existing.status === "published" && (body.title || body.summary || body.contentBlocks)) {
      updateData.lastEditedAt = new Date();
      const deliveryCount = await prisma.announcementDelivery.count({
        where: { announcementId: id },
      });
      if (deliveryCount > 0) {
        warnings.push(t("announcements.editAfterPublish").replace("{count}", String(deliveryCount)));
      }
    }

    // Apply category link changes (already validated above)
    if (body.categoryIds !== undefined) {
      await prisma.announcementCategoryLink.deleteMany({ where: { announcementId: id } });
      await Promise.all(
        body.categoryIds.map((categoryId) =>
          prisma.announcementCategoryLink.create({ data: { announcementId: id, categoryId } }),
        ),
      );
    }

    // Apply tag link changes (already validated above)
    if (body.tagIds !== undefined) {
      await prisma.announcementTagLink.deleteMany({ where: { announcementId: id } });
      if (body.tagIds.length > 0) {
        await Promise.all(
          body.tagIds.map((tagId) =>
            prisma.announcementTagLink.create({ data: { announcementId: id, tagId } }),
          ),
        );
      }
    }

    // Apply role visibility changes (already validated above)
    if (body.roleIds !== undefined) {
      await prisma.announcementRoleVisibility.deleteMany({ where: { announcementId: id } });
      if (body.roleIds.length > 0) {
        await Promise.all(
          body.roleIds.map((roleId) =>
            prisma.announcementRoleVisibility.create({ data: { announcementId: id, roleId } }),
          ),
        );
      }
    }

    const ann = await prisma.announcement.update({
      where: { id },
      data: updateData,
      include: announcementInclude,
    });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "update",
      resource: "announcement",
      details: { announcementId: ann.id, changes: Object.keys(updateData) },
    });

    const stats = ann.status === "published" ? await getDeliveryStats(prisma, ann.id) : undefined;
    const response = formatAdminResponse(ann as unknown as AnnouncementWithRelations, stats);
    return c.json({ ...response, warnings: warnings.length > 0 ? warnings : undefined }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Publish announcement
announcementsApp.openapi(publishRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("announcement:publish")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const ann = await prisma.announcement.findUnique({
      where: { id },
      include: {
        categoryLinks: true,
        roleVisibility: true,
      },
    });

    if (!ann) {
      return c.json({ error: "ANNOUNCEMENT_NOT_FOUND", message: t("announcements.notFound") }, 404);
    }

    if (ann.status === "published") {
      return c.json({ error: "ALREADY_PUBLISHED", message: t("announcements.alreadyPublished") }, 409);
    }

    if (ann.status === "archived") {
      return c.json({ error: "CANNOT_PUBLISH_ARCHIVED", message: t("announcements.cannotUpdateArchived") }, 400 as never);
    }

    // Validate publishing requirements
    if (ann.categoryLinks.length === 0) {
      return c.json({ error: "MISSING_CATEGORIES", message: t("announcements.missingCategories") }, 400 as never);
    }
    if (ann.visibility === "private" && ann.roleVisibility.length === 0) {
      return c.json({ error: "PRIVATE_NEEDS_ROLES", message: t("announcements.privateNeedsRoles") }, 400 as never);
    }

    // Validate media assets still exist
    const contentBlocks = JSON.parse(ann.contentBlocks);
    const mediaAssetIds = contentBlocks
      .filter((b: Record<string, unknown>) => "mediaAssetId" in b)
      .map((b: Record<string, unknown>) => b.mediaAssetId as string);
    if (mediaAssetIds.length > 0) {
      const assets = await prisma.mediaAsset.findMany({
        where: { id: { in: mediaAssetIds }, archivedAt: null },
        select: { id: true },
      });
      if (assets.length !== mediaAssetIds.length) {
        return c.json({ error: "MEDIA_NOT_FOUND", message: t("announcements.mediaNotFound") }, 400 as never);
      }
    }

    // Optimistic locking: only publish if still draft
    const updated = await prisma.announcement.updateMany({
      where: { id, status: "draft" },
      data: { status: "published", publishedAt: new Date() },
    });

    if (updated.count === 0) {
      return c.json({ error: "CONCURRENT_PUBLISH", message: t("announcements.concurrentPublish") }, 409);
    }

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "announcement:publish",
      resource: "announcement",
      details: { announcementId: id, title: ann.title, visibility: ann.visibility },
    });

    return c.json({
      message: t("announcements.published"),
      deliverySummary: {
        totalSubscribers: 0,
        deliveryCount: 0,
        suppressedCount: 0,
      },
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Unpublish announcement
announcementsApp.openapi(unpublishRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("announcement:update")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann) {
      return c.json({ error: "ANNOUNCEMENT_NOT_FOUND", message: t("announcements.notFound") }, 404);
    }
    if (ann.status !== "published") {
      return c.json({ error: "NOT_PUBLISHED", message: t("announcements.notPublished") }, 400);
    }

    const deliveryCount = await prisma.announcementDelivery.count({
      where: { announcementId: id },
    });

    await prisma.announcement.update({
      where: { id },
      data: { status: "draft", publishedAt: null },
    });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "announcement:unpublish",
      resource: "announcement",
      details: { announcementId: id, title: ann.title, deliveryCount },
    });

    const warnings: string[] = [];
    if (deliveryCount > 0) {
      warnings.push(`${deliveryCount} deliveries have already been sent. Recipients will see the old content in their emails.`);
    }

    return c.json({
      message: t("announcements.unpublished"),
      warnings: warnings.length > 0 ? warnings : undefined,
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Archive announcement
announcementsApp.openapi(archiveRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("announcement:delete")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const ann = await prisma.announcement.findUnique({ where: { id } });
    if (!ann) {
      return c.json({ error: "ANNOUNCEMENT_NOT_FOUND", message: t("announcements.notFound") }, 404);
    }

    await prisma.announcement.update({
      where: { id },
      data: { status: "archived" },
    });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "announcement:archive",
      resource: "announcement",
      details: { announcementId: id, title: ann.title },
    });

    return c.json({ message: t("announcements.archived") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// --- Public Handlers ---

// Public: List published announcements (visibility-filtered)
// @ts-expect-error — handler returns error codes not in route definition
announcementsApp.openapi(publicListRoute, async (c) => {
  const auth = c.get("auth") as AuthContext | undefined;

  const url = new URL(c.req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10) || 20));
  const categorySlug = url.searchParams.get("category");
  const tagSlug = url.searchParams.get("tag");
  const search = url.searchParams.get("search")?.slice(0, 200);
  const sortBy = url.searchParams.get("sortBy") ?? "publishedAt";
  const sortOrder = url.searchParams.get("sortOrder") ?? "desc";

  const allowedSortBy = ["publishedAt", "title"];
  if (!allowedSortBy.includes(sortBy) || !["asc", "desc"].includes(sortOrder)) {
    return c.json({ error: "INVALID_SORT", message: "Invalid sort parameters" }, 400 as never);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Base filter: published only
    const where: Record<string, unknown> = {
      status: "published",
    };

    // Visibility filtering
    if (auth?.roleIds && auth.roleIds.length > 0) {
      // Authenticated: see public + private where user has matching role
      where.OR = [
        { visibility: "public" },
        {
          visibility: "private",
          roleVisibility: { some: { roleId: { in: auth.roleIds } } },
        },
      ];
    } else {
      // Unauthenticated: public only
      where.visibility = "public";
    }

    if (categorySlug) {
      where.categoryLinks = { some: { category: { slug: categorySlug } } };
    }
    if (tagSlug) {
      where.tagLinks = { some: { tag: { slug: tagSlug } } };
    }
    if (search) {
      // Must combine with existing OR if visibility OR exists
      const searchOR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOR }];
        delete where.OR;
      } else {
        where.OR = searchOR;
      }
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          categoryLinks: { include: { category: { select: { id: true, name: true, slug: true } } } },
          tagLinks: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.announcement.count({ where }),
    ]);

    return c.json({
      announcements: announcements.map((ann) => ({
        id: ann.id,
        title: ann.title,
        slug: ann.slug,
        summary: ann.summary,
        contentBlocks: JSON.parse(ann.contentBlocks),
        visibility: ann.visibility,
        categories: ann.categoryLinks.map((cl) => cl.category),
        tags: ann.tagLinks.map((tl) => tl.tag),
        author: { id: ann.author.id, name: ann.author.name },
        publishedAt: ann.publishedAt?.toISOString() ?? null,
        lastEditedAt: ann.lastEditedAt?.toISOString() ?? null,
      })),
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

// Public: Get published announcement by slug (visibility-filtered)
announcementsApp.openapi(publicGetRoute, async (c) => {
  const auth = c.get("auth") as AuthContext | undefined;
  const { slug } = c.req.valid("param");

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const ann = await prisma.announcement.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true } },
        categoryLinks: { include: { category: { select: { id: true, name: true, slug: true } } } },
        tagLinks: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        roleVisibility: { select: { roleId: true } },
      },
    });

    // Not found OR not published → 404 (same response for both to prevent info leakage)
    if (!ann || ann.status !== "published") {
      return c.json({ error: "ANNOUNCEMENT_NOT_FOUND", message: t("announcements.notFound") }, 404);
    }

    // Visibility check: private announcements require matching role
    if (ann.visibility === "private") {
      const userRoleIds = auth?.roleIds ?? [];
      const requiredRoleIds = ann.roleVisibility.map((rv) => rv.roleId);
      const hasAccess = requiredRoleIds.some((rid) => userRoleIds.includes(rid));
      if (!hasAccess) {
        // Return 404 (not 403) to prevent info leakage
        return c.json({ error: "ANNOUNCEMENT_NOT_FOUND", message: t("announcements.notFound") }, 404);
      }
    }

    return c.json({
      id: ann.id,
      title: ann.title,
      slug: ann.slug,
      summary: ann.summary,
      contentBlocks: JSON.parse(ann.contentBlocks),
      visibility: ann.visibility,
      categories: ann.categoryLinks.map((cl) => cl.category),
      tags: ann.tagLinks.map((tl) => tl.tag),
      author: { id: ann.author.id, name: ann.author.name },
      publishedAt: ann.publishedAt?.toISOString() ?? null,
      lastEditedAt: ann.lastEditedAt?.toISOString() ?? null,
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
