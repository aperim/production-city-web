/**
 * Admin media asset management handlers:
 * GET /v1/admin/media/assets — list with pagination, filtering, search
 * GET /v1/admin/media/assets/:id — asset detail
 * PATCH /v1/admin/media/assets/:id — update metadata
 * DELETE /v1/admin/media/assets/:id — soft-delete (archive)
 * POST /v1/admin/media/assets/:id/restore — restore archived asset
 * GET /v1/admin/media/pairs — list all pairs
 * POST /v1/admin/media/pairs — create a pair
 * DELETE /v1/admin/media/pairs/:id — remove a pair
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { authMiddleware, requirePermission } from "../auth/middleware.js";
import { createAuditLog } from "../auth/audit.js";
import type { AuthContext } from "../auth/middleware.js";
import { t } from "../i18n/index.js";

type Bindings = { DB: D1Database; ALLOWED_ORIGIN: string };

export const mediaAdminApp = new OpenAPIHono<{ Bindings: Bindings; Variables: { auth: AuthContext } }>();

/** --- Schemas --- */

const MediaAssetSchema = z.object({
  id: z.string(),
  source: z.string(),
  externalId: z.string(),
  externalUrl: z.string().nullable(),
  photographer: z.string(),
  photographerUrl: z.string().nullable(),
  publicPath: z.string(),
  localPath: z.string(),
  downloadUrl: z.string().nullable(),
  alt: z.string(),
  originalWidth: z.number(),
  originalHeight: z.number(),
  averageColor: z.string().nullable(),
  mimeType: z.string(),
  fileSize: z.number().nullable(),
  license: z.string(),
  attributionRequired: z.boolean(),
  attributionText: z.string().nullable(),
  aiAssisted: z.boolean(),
  aiGenerated: z.boolean(),
  hasFirstNationsPermission: z.boolean(),
  culturalNotes: z.string().nullable(),
  themeVariant: z.string(),
  contentContext: z.string().nullable(),
  reviewStatus: z.string(),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const PaginationSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

const MediaAssetListResponseSchema = z.object({
  assets: z.array(MediaAssetSchema),
  pagination: PaginationSchema,
});

const MediaAssetListQuerySchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("20"),
  search: z.string().optional(),
  source: z.string().optional(),
  themeVariant: z.string().optional(),
  reviewStatus: z.string().optional(),
  includeArchived: z.string().optional(),
});

const PatchMediaAssetBodySchema = z.object({
  alt: z.string().min(1).optional(),
  aiAssisted: z.boolean().optional(),
  aiGenerated: z.boolean().optional(),
  hasFirstNationsPermission: z.boolean().optional(),
  culturalNotes: z.string().nullable().optional(),
  reviewStatus: z.enum(["accepted", "rejected", "pending"]).optional(),
});

const MediaPairSchema = z.object({
  id: z.string(),
  contentContext: z.string(),
  lightAssetId: z.string(),
  darkAssetId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const CreateMediaPairBodySchema = z.object({
  contentContext: z.string().regex(/^[a-zA-Z0-9-]+$/).max(100),
  lightAssetId: z.string().min(1),
  darkAssetId: z.string().min(1),
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

/** --- Route Definitions --- */

const listAssetsRoute = createRoute({
  method: "get",
  path: "/v1/admin/media/assets",
  summary: "List media assets (admin)",
  request: { query: MediaAssetListQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: MediaAssetListResponseSchema } }, description: "Asset list" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid params" },
  },
});

const getAssetRoute = createRoute({
  method: "get",
  path: "/v1/admin/media/assets/{id}",
  summary: "Get media asset detail (admin)",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: MediaAssetSchema } }, description: "Asset detail" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const patchAssetRoute = createRoute({
  method: "patch",
  path: "/v1/admin/media/assets/{id}",
  summary: "Update media asset metadata (admin)",
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: PatchMediaAssetBodySchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: MediaAssetSchema } }, description: "Updated" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const deleteAssetRoute = createRoute({
  method: "delete",
  path: "/v1/admin/media/assets/{id}",
  summary: "Archive media asset (admin)",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Archived" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const restoreAssetRoute = createRoute({
  method: "post",
  path: "/v1/admin/media/assets/{id}/restore",
  summary: "Restore archived media asset (admin)",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Restored" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const listPairsRoute = createRoute({
  method: "get",
  path: "/v1/admin/media/pairs",
  summary: "List media pairs (admin)",
  responses: {
    200: { content: { "application/json": { schema: z.object({ pairs: z.array(MediaPairSchema) }) } }, description: "Pair list" },
  },
});

const createPairRoute = createRoute({
  method: "post",
  path: "/v1/admin/media/pairs",
  summary: "Create media pair (admin)",
  request: {
    body: { content: { "application/json": { schema: CreateMediaPairBodySchema } } },
  },
  responses: {
    201: { content: { "application/json": { schema: MediaPairSchema } }, description: "Created" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid" },
    409: { content: { "application/json": { schema: ErrorSchema } }, description: "Conflict" },
  },
});

const deletePairRoute = createRoute({
  method: "delete",
  path: "/v1/admin/media/pairs/{id}",
  summary: "Remove media pair (admin)",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: z.object({ message: z.string() }) } }, description: "Removed" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

/** --- Auth middleware --- */
mediaAdminApp.use("/v1/admin/media/*", authMiddleware());
mediaAdminApp.use("/v1/admin/media/*", requirePermission("media", "manage"));

/** --- Helpers --- */

/** Serialized media asset for JSON responses */
interface SerializedMediaAsset {
  id: string;
  source: string;
  externalId: string;
  externalUrl: string | null;
  photographer: string;
  photographerUrl: string | null;
  publicPath: string;
  localPath: string;
  downloadUrl: string | null;
  alt: string;
  originalWidth: number;
  originalHeight: number;
  averageColor: string | null;
  mimeType: string;
  fileSize: number | null;
  license: string;
  attributionRequired: boolean;
  attributionText: string | null;
  aiAssisted: boolean;
  aiGenerated: boolean;
  hasFirstNationsPermission: boolean;
  culturalNotes: string | null;
  themeVariant: string;
  contentContext: string | null;
  reviewStatus: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function serializeAsset(asset: {
  id: string;
  source: string;
  externalId: string;
  externalUrl: string | null;
  photographer: string;
  photographerUrl: string | null;
  publicPath: string;
  localPath: string;
  downloadUrl: string | null;
  alt: string;
  originalWidth: number;
  originalHeight: number;
  averageColor: string | null;
  mimeType: string;
  fileSize: number | null;
  license: string;
  attributionRequired: boolean;
  attributionText: string | null;
  aiAssisted: boolean;
  aiGenerated: boolean;
  hasFirstNationsPermission: boolean;
  culturalNotes: string | null;
  themeVariant: string;
  contentContext: string | null;
  reviewStatus: string;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SerializedMediaAsset {
  return {
    id: asset.id,
    source: asset.source,
    externalId: asset.externalId,
    externalUrl: asset.externalUrl,
    photographer: asset.photographer,
    photographerUrl: asset.photographerUrl,
    publicPath: asset.publicPath,
    localPath: asset.localPath,
    downloadUrl: asset.downloadUrl,
    alt: asset.alt,
    originalWidth: asset.originalWidth,
    originalHeight: asset.originalHeight,
    averageColor: asset.averageColor,
    mimeType: asset.mimeType,
    fileSize: asset.fileSize,
    license: asset.license,
    attributionRequired: asset.attributionRequired,
    attributionText: asset.attributionText,
    aiAssisted: asset.aiAssisted,
    aiGenerated: asset.aiGenerated,
    hasFirstNationsPermission: asset.hasFirstNationsPermission,
    culturalNotes: asset.culturalNotes,
    themeVariant: asset.themeVariant,
    contentContext: asset.contentContext,
    reviewStatus: asset.reviewStatus,
    archivedAt: asset.archivedAt ? String(asset.archivedAt) : null,
    createdAt: String(asset.createdAt),
    updatedAt: String(asset.updatedAt),
  };
}

/** --- Handlers --- */

mediaAdminApp.openapi(listAssetsRoute, async (c) => {
  const query = c.req.valid("query");
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize, 10) || 20));

  if (query.themeVariant && !["light", "dark", "universal"].includes(query.themeVariant)) {
    return c.json({ error: "invalid_input", message: t("admin.media.validation.invalidVariant") }, 400);
  }
  if (query.reviewStatus && !["accepted", "rejected", "pending"].includes(query.reviewStatus)) {
    return c.json({ error: "invalid_input", message: t("admin.media.validation.invalidStatus") }, 400);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const where: Record<string, unknown> = {};

    if (query.includeArchived !== "true") {
      where.archivedAt = null;
    }
    if (query.source) where.source = query.source;
    if (query.themeVariant) where.themeVariant = query.themeVariant;
    if (query.reviewStatus) where.reviewStatus = query.reviewStatus;
    if (query.search) {
      where.OR = [
        { photographer: { contains: query.search } },
        { alt: { contains: query.search } },
        { contentContext: { contains: query.search } },
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.mediaAsset.count({ where }),
    ]);

    return c.json({
      assets: assets.map(serializeAsset),
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

mediaAdminApp.openapi(getAssetRoute, async (c) => {
  const { id } = c.req.valid("param");
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      return c.json({ error: "not_found", message: t("admin.media.asset.notFound") }, 404);
    }
    return c.json(serializeAsset(asset), 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

mediaAdminApp.openapi(patchAssetRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const auth = c.get("auth") as AuthContext;

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "not_found", message: t("admin.media.asset.notFound") }, 404);
    }

    const updated = await prisma.mediaAsset.update({ where: { id }, data: body });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "media.asset.updated",
      resource: "media_asset",
      details: { assetId: id, changes: Object.keys(body) },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json(serializeAsset(updated), 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

mediaAdminApp.openapi(deleteAssetRoute, async (c) => {
  const { id } = c.req.valid("param");
  const auth = c.get("auth") as AuthContext;

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "not_found", message: t("admin.media.asset.notFound") }, 404);
    }

    await prisma.mediaAsset.update({
      where: { id },
      data: { archivedAt: new Date(), archivedBy: auth.user.id },
    });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "media.asset.archived",
      resource: "media_asset",
      details: { assetId: id },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({ message: t("admin.media.asset.archived") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

mediaAdminApp.openapi(restoreAssetRoute, async (c) => {
  const { id } = c.req.valid("param");
  const auth = c.get("auth") as AuthContext;

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "not_found", message: t("admin.media.asset.notFound") }, 404);
    }

    await prisma.mediaAsset.update({
      where: { id },
      data: { archivedAt: null, archivedBy: null },
    });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "media.asset.restored",
      resource: "media_asset",
      details: { assetId: id },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({ message: t("admin.media.asset.restored") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

mediaAdminApp.openapi(listPairsRoute, async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    const pairs = await prisma.mediaPair.findMany({ orderBy: { createdAt: "desc" } });
    return c.json({
      pairs: pairs.map((p) => ({
        ...p,
        createdAt: String(p.createdAt),
        updatedAt: String(p.updatedAt),
      })),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

mediaAdminApp.openapi(createPairRoute, async (c) => {
  const body = c.req.valid("json");
  const auth = c.get("auth") as AuthContext;

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Check for existing pair with same contentContext
    const existing = await prisma.mediaPair.findUnique({
      where: { contentContext: body.contentContext },
    });
    if (existing) {
      return c.json({ error: "conflict", message: t("admin.media.pair.alreadyExists") }, 409);
    }

    // Verify both assets exist
    const [light, dark] = await Promise.all([
      prisma.mediaAsset.findUnique({ where: { id: body.lightAssetId } }),
      prisma.mediaAsset.findUnique({ where: { id: body.darkAssetId } }),
    ]);
    if (!light || !dark) {
      return c.json({ error: "invalid_input", message: t("admin.media.asset.notFound") }, 400);
    }

    let pair;
    try {
      pair = await prisma.mediaPair.create({
        data: {
          contentContext: body.contentContext,
          lightAssetId: body.lightAssetId,
          darkAssetId: body.darkAssetId,
        },
      });
    } catch (err: unknown) {
      // Unique constraint violation — race condition with check above
      if (err instanceof Error && err.message.includes("Unique")) {
        return c.json({ error: "conflict", message: t("admin.media.pair.alreadyExists") }, 409);
      }
      throw err;
    }

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "media.pair.created",
      resource: "media_pair",
      details: { contentContext: body.contentContext },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({
      ...pair,
      createdAt: String(pair.createdAt),
      updatedAt: String(pair.updatedAt),
    }, 201);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

mediaAdminApp.openapi(deletePairRoute, async (c) => {
  const { id } = c.req.valid("param");
  const auth = c.get("auth") as AuthContext;

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const existing = await prisma.mediaPair.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "not_found", message: t("admin.media.pair.notFound") }, 404);
    }

    await prisma.mediaPair.delete({ where: { id } });

    await createAuditLog(prisma, {
      actorId: auth.user.id,
      action: "media.pair.deleted",
      resource: "media_pair",
      details: { contentContext: existing.contentContext },
      ipAddress: c.req.header("CF-Connecting-IP"),
      userAgent: c.req.header("User-Agent"),
    });

    return c.json({ message: t("admin.media.pair.deleted") }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
