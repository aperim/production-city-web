/**
 * Admin tags & public read:
 * GET    /v1/tags              — list all tags (public)
 * POST   /v1/admin/tags        — create tag
 * PATCH  /v1/admin/tags/:id    — update tag
 * DELETE /v1/admin/tags/:id    — delete tag (cascade removes links)
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { createAuditLog } from "../auth/audit.js";
import { t } from "../i18n/index.js";
import { generateUniqueSlug } from "../lib/slug.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.js";

type Bindings = { DB: D1Database; ALLOWED_ORIGIN: string };

export const tagsApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

// --- Schemas ---

const TagPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const TagAdminSchema = TagPublicSchema.extend({
  announcementCount: z.number(),
});

const CreateTagSchema = z.object({
  name: z.string().trim().min(1).max(50).refine((v) => /[a-z0-9]/i.test(v), {
    message: "Name must contain at least one alphanumeric character",
  }),
});

const UpdateTagSchema = z.object({
  name: z.string().trim().min(1).max(50).refine((v) => /[a-z0-9]/i.test(v), {
    message: "Name must contain at least one alphanumeric character",
  }).optional(),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

// --- Rate limiting ---

const publicRateLimit = rateLimitMiddleware({
  keyFn: (c) => c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown",
  limit: 60,
  windowSeconds: 60,
});

// --- Route definitions ---

const listTagsRoute = createRoute({
  method: "get",
  path: "/v1/tags",
  summary: "List all tags (public)",
  responses: {
    200: {
      content: { "application/json": { schema: z.object({ tags: z.array(TagPublicSchema) }) } },
      description: "Tags",
    },
  },
});

const createTagRoute = createRoute({
  method: "post",
  path: "/v1/admin/tags",
  summary: "Create tag",
  request: {
    body: { content: { "application/json": { schema: CreateTagSchema } } },
  },
  responses: {
    201: { content: { "application/json": { schema: TagAdminSchema } }, description: "Created" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Conflict" },
  },
});

const updateTagRoute = createRoute({
  method: "patch",
  path: "/v1/admin/tags/{id}",
  summary: "Update tag",
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: UpdateTagSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: TagAdminSchema } }, description: "Updated" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Conflict" },
  },
});

const deleteTagRoute = createRoute({
  method: "delete",
  path: "/v1/admin/tags/{id}",
  summary: "Delete tag",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Deleted" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

// --- Auth middleware ---

tagsApp.use("/v1/admin/tags", authMiddleware());
tagsApp.use("/v1/admin/tags/*", authMiddleware());

// --- Rate limiting ---

tagsApp.use("/v1/tags", publicRateLimit);

// --- Handlers ---

// Public: List all tags
tagsApp.openapi(listTagsRoute, async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const tags = await prisma.announcementTag.findMany({
      orderBy: { name: "asc" },
    });

    return c.json({
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      })),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Create tag
tagsApp.openapi(createTagRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("tag:create")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const body = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Check name uniqueness
    const existing = await prisma.announcementTag.findUnique({ where: { name: body.name } });
    if (existing) {
      return c.json({ error: "TAG_NAME_TAKEN", message: t("tags.nameTaken") }, 409);
    }

    const slug = await generateUniqueSlug(body.name, async (s) => {
      const found = await prisma.announcementTag.findUnique({ where: { slug: s } });
      return found !== null;
    });

    let tag;
    try {
      tag = await prisma.announcementTag.create({
        data: { name: body.name, slug },
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return c.json({ error: "TAG_NAME_TAKEN", message: t("tags.nameTaken") }, 409);
      }
      throw err;
    }

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "create",
      resource: "tag",
      details: { tagId: tag.id, name: tag.name },
    });

    return c.json({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      announcementCount: 0,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    }, 201);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Update tag
tagsApp.openapi(updateTagRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("tag:update")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.announcementTag.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "TAG_NOT_FOUND", message: t("tags.notFound") }, 404);
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined && body.name !== existing.name) {
      const nameConflict = await prisma.announcementTag.findUnique({ where: { name: body.name } });
      if (nameConflict && nameConflict.id !== id) {
        return c.json({ error: "TAG_NAME_TAKEN", message: t("tags.nameTaken") }, 409);
      }
      updateData.name = body.name;
      updateData.slug = await generateUniqueSlug(body.name, async (s) => {
        const found = await prisma.announcementTag.findUnique({ where: { slug: s } });
        return found !== null && found.id !== id;
      });
    }

    let tag;
    try {
      tag = await prisma.announcementTag.update({
        where: { id },
        data: updateData,
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return c.json({ error: "TAG_NAME_TAKEN", message: t("tags.nameTaken") }, 409);
      }
      throw err;
    }

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "update",
      resource: "tag",
      details: { tagId: tag.id, changes: Object.keys(updateData) },
    });

    const announcementCount = await prisma.announcementTagLink.count({
      where: { tagId: id },
    });

    return c.json({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      announcementCount,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Delete tag (cascade removes links)
tagsApp.openapi(deleteTagRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("tag:delete")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.announcementTag.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "TAG_NOT_FOUND", message: t("tags.notFound") }, 404);
    }

    await prisma.announcementTag.delete({ where: { id } });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "delete",
      resource: "tag",
      details: { tagId: id, name: existing.name },
    });

    return c.json({ message: t("tags.deleted") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
