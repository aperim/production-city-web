/**
 * Admin categories & public read:
 * GET    /v1/categories              — list active categories (public)
 * GET    /v1/categories/:slug        — get category by slug (public)
 * POST   /v1/admin/categories        — create category
 * PATCH  /v1/admin/categories/:id    — update category
 * DELETE /v1/admin/categories/:id    — deactivate category (soft-delete)
 * PATCH  /v1/admin/categories/reorder — reorder categories
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

export const categoriesApp = new OpenAPIHono<{
  Bindings: Bindings;
  Variables: { auth: AuthContext };
}>();

// --- Schemas ---

const CategoryPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CategoryAdminSchema = CategoryPublicSchema.extend({
  isActive: z.boolean(),
  announcementCount: z.number(),
  subscriberCount: z.number(),
});

const PaginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

const CategoryListResponseSchema = z.object({
  categories: z.array(CategoryPublicSchema),
  pagination: PaginationSchema,
});

const CreateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).refine((v) => /[a-z0-9]/i.test(v), {
    message: "Name must contain at least one alphanumeric character",
  }),
  description: z.string().max(500).optional(),
});

const UpdateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).refine((v) => /[a-z0-9]/i.test(v), {
    message: "Name must contain at least one alphanumeric character",
  }).optional(),
  description: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const ReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int().min(0),
    }),
  ).min(1),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

// --- Rate limiting for public endpoints ---

const publicRateLimit = rateLimitMiddleware({
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

const listCategoriesRoute = createRoute({
  method: "get",
  path: "/v1/categories",
  summary: "List active categories (public)",
  responses: {
    200: { content: { "application/json": { schema: CategoryListResponseSchema } }, description: "Categories" },
  },
});

const getCategoryRoute = createRoute({
  method: "get",
  path: "/v1/categories/{slug}",
  summary: "Get category by slug (public)",
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    200: { content: { "application/json": { schema: CategoryPublicSchema } }, description: "Category" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const createCategoryRoute = createRoute({
  method: "post",
  path: "/v1/admin/categories",
  summary: "Create category",
  request: {
    body: { content: { "application/json": { schema: CreateCategorySchema } } },
  },
  responses: {
    201: { content: { "application/json": { schema: CategoryAdminSchema } }, description: "Created" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Conflict" },
  },
});

const updateCategoryRoute = createRoute({
  method: "patch",
  path: "/v1/admin/categories/{id}",
  summary: "Update category",
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: UpdateCategorySchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: CategoryAdminSchema } }, description: "Updated" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Conflict" },
  },
});

const deleteCategoryRoute = createRoute({
  method: "delete",
  path: "/v1/admin/categories/{id}",
  summary: "Deactivate category (soft-delete)",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Deactivated" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const reorderCategoriesRoute = createRoute({
  method: "patch",
  path: "/v1/admin/categories/reorder",
  summary: "Reorder categories",
  request: {
    body: { content: { "application/json": { schema: ReorderSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Reordered" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Bad request" },
  },
});

// --- Auth middleware ---

categoriesApp.use("/v1/admin/categories", authMiddleware());
categoriesApp.use("/v1/admin/categories/*", authMiddleware());

// --- Rate limiting on public endpoints ---

categoriesApp.use("/v1/categories", publicRateLimit);
categoriesApp.use("/v1/categories/*", publicDetailRateLimit);

// --- Handlers ---

// Public: List active categories
categoriesApp.openapi(listCategoriesRoute, async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const categories = await prisma.announcementCategory.findMany({
      where: { isActive: 1 },
      orderBy: { sortOrder: "asc" },
    });

    return c.json({
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        createdAt: cat.createdAt.toISOString(),
        updatedAt: cat.updatedAt.toISOString(),
      })),
      pagination: {
        page: 1,
        pageSize: categories.length,
        total: categories.length,
        totalPages: 1,
      },
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Public: Get category by slug
categoriesApp.openapi(getCategoryRoute, async (c) => {
  const { slug } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const cat = await prisma.announcementCategory.findUnique({
      where: { slug },
    });

    if (!cat || cat.isActive !== 1) {
      return c.json({ error: "CATEGORY_NOT_FOUND", message: t("categories.notFound") }, 404);
    }

    return c.json({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      sortOrder: cat.sortOrder,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Create category
categoriesApp.openapi(createCategoryRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("category:create")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const body = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Check name uniqueness
    const existing = await prisma.announcementCategory.findUnique({
      where: { name: body.name },
    });
    if (existing) {
      return c.json({ error: "CATEGORY_NAME_TAKEN", message: t("categories.nameTaken") }, 409);
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(body.name, async (s) => {
      const found = await prisma.announcementCategory.findUnique({ where: { slug: s } });
      return found !== null;
    });

    // Get next sort order
    const maxSort = await prisma.announcementCategory.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    let cat;
    try {
      cat = await prisma.announcementCategory.create({
        data: {
          name: body.name,
          slug,
          description: body.description ?? null,
          sortOrder,
        },
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return c.json({ error: "CATEGORY_NAME_TAKEN", message: t("categories.nameTaken") }, 409);
      }
      throw err;
    }

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "create",
      resource: "category",
      details: { categoryId: cat.id, name: cat.name }
    });

    return c.json({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive === 1,
      announcementCount: 0,
      subscriberCount: 0,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }, 201);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Reorder categories (MUST be registered before /:id routes)
categoriesApp.openapi(reorderCategoriesRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("category:update")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { items } = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Verify all IDs exist
    const ids = items.map((item) => item.id);
    const existing = await prisma.announcementCategory.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    if (existing.length !== ids.length) {
      return c.json({ error: "INVALID_SORT_ORDER", message: t("categories.invalidSortOrder") }, 400);
    }

    // Update all sort orders
    for (const item of items) {
      await prisma.announcementCategory.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      });
    }

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "reorder",
      resource: "category",
      details: { itemCount: items.length },
    });

    return c.json({ message: t("categories.reordered") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Update category
categoriesApp.openapi(updateCategoryRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("category:update")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.announcementCategory.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "CATEGORY_NOT_FOUND", message: t("categories.notFound") }, 404);
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined && body.name !== existing.name) {
      // Check name uniqueness
      const nameConflict = await prisma.announcementCategory.findUnique({ where: { name: body.name } });
      if (nameConflict && nameConflict.id !== id) {
        return c.json({ error: "CATEGORY_NAME_TAKEN", message: t("categories.nameTaken") }, 409);
      }
      updateData.name = body.name;

      // Regenerate slug when name changes
      updateData.slug = await generateUniqueSlug(body.name, async (s) => {
        const found = await prisma.announcementCategory.findUnique({ where: { slug: s } });
        return found !== null && found.id !== id;
      });
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.sortOrder !== undefined) {
      updateData.sortOrder = body.sortOrder;
    }

    let cat;
    try {
      cat = await prisma.announcementCategory.update({
        where: { id },
        data: updateData,
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return c.json({ error: "CATEGORY_NAME_TAKEN", message: t("categories.nameTaken") }, 409);
      }
      throw err;
    }

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "update",
      resource: "category",
      details: { categoryId: cat.id, changes: Object.keys(updateData) },
    });

    // Get counts for admin response
    const announcementCount = await prisma.announcementCategoryLink.count({
      where: {
        categoryId: id,
        announcement: { status: "published", visibility: "public" },
      },
    });
    const subscriberCount = await prisma.categorySubscription.count({
      where: { categoryId: id, status: "confirmed" },
    });

    return c.json({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive === 1,
      announcementCount,
      subscriberCount,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

// Admin: Delete (deactivate) category
categoriesApp.openapi(deleteCategoryRoute, async (c) => {
  const auth = c.get("auth") as AuthContext;
  if (!auth.permissions.includes("category:delete")) {
    return c.json({ error: "FORBIDDEN", message: t("permissions.forbidden") }, 403 as never);
  }

  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.announcementCategory.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "CATEGORY_NOT_FOUND", message: t("categories.notFound") }, 404);
    }

    await prisma.announcementCategory.update({
      where: { id },
      data: { isActive: 0 },
    });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "delete",
      resource: "category",
      details: { categoryId: id, name: existing.name },
    });

    return c.json({ message: t("categories.deactivated") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

