/**
 * Public media endpoints (no auth required):
 * GET /v1/media/pairs/:contentContext — single pair by content context
 * GET /v1/media/pairs — batch fetch: ?contexts=hero-home,hero-facilities
 * GET /v1/media/assets/:id — single asset metadata
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { t } from "../i18n/index.js";

type Bindings = { DB: D1Database; ALLOWED_ORIGIN: string };

export const mediaApp = new OpenAPIHono<{ Bindings: Bindings }>();

/** Content context validation: alphanumeric + hyphens, max 100 chars */
const contentContextRegex = /^[a-zA-Z0-9-]{1,100}$/;

/** --- Response Schemas --- */

const PublicMediaAssetSchema = z.object({
  id: z.string(),
  publicPath: z.string(),
  alt: z.string(),
  width: z.number(),
  height: z.number(),
  averageColor: z.string().nullable(),
  photographer: z.string(),
  photographerUrl: z.string().nullable(),
  source: z.string(),
  externalUrl: z.string().nullable(),
  aiAssisted: z.boolean(),
  aiGenerated: z.boolean(),
  hasFirstNationsPermission: z.boolean(),
  license: z.string(),
  attributionText: z.string().nullable(),
});

const MediaPairResponseSchema = z.object({
  id: z.string(),
  contentContext: z.string(),
  light: PublicMediaAssetSchema,
  dark: PublicMediaAssetSchema,
});

const ErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});

/** --- Route Definitions --- */

const getPairRoute = createRoute({
  method: "get",
  path: "/v1/media/pairs/{contentContext}",
  summary: "Get media pair by content context",
  request: { params: z.object({ contentContext: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: MediaPairResponseSchema } }, description: "Media pair" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid context" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

const batchPairsRoute = createRoute({
  method: "get",
  path: "/v1/media/pairs",
  summary: "Batch get media pairs by content contexts",
  request: { query: z.object({ contexts: z.string().optional() }) },
  responses: {
    200: { content: { "application/json": { schema: z.object({ pairs: z.record(z.string(), MediaPairResponseSchema) }) } }, description: "Media pairs" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid contexts" },
  },
});

const getAssetRoute = createRoute({
  method: "get",
  path: "/v1/media/assets/{id}",
  summary: "Get media asset metadata",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { content: { "application/json": { schema: PublicMediaAssetSchema } }, description: "Asset metadata" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "Not found" },
  },
});

/** --- Helpers --- */

interface MediaAssetRow {
  id: string;
  publicPath: string;
  alt: string;
  originalWidth: number;
  originalHeight: number;
  averageColor: string | null;
  photographer: string;
  photographerUrl: string | null;
  source: string;
  externalUrl: string | null;
  aiAssisted: boolean;
  aiGenerated: boolean;
  hasFirstNationsPermission: boolean;
  license: string;
  attributionText: string | null;
}

function mapPublicAsset(asset: MediaAssetRow) {
  return {
    id: asset.id,
    publicPath: asset.publicPath,
    alt: asset.alt,
    width: asset.originalWidth,
    height: asset.originalHeight,
    averageColor: asset.averageColor ?? null,
    photographer: asset.photographer,
    photographerUrl: asset.photographerUrl ?? null,
    source: asset.source,
    externalUrl: asset.externalUrl ?? null,
    aiAssisted: asset.aiAssisted,
    aiGenerated: asset.aiGenerated,
    hasFirstNationsPermission: asset.hasFirstNationsPermission,
    license: asset.license,
    attributionText: asset.attributionText ?? null,
  };
}

/** Cache headers for public endpoints */
function setCacheHeaders(c: { header: (name: string, value: string) => void }, updatedAt?: unknown) {
  c.header("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  c.header("X-Content-Type-Options", "nosniff");
  if (updatedAt) {
    const etag = `"${String(updatedAt)}"`;
    c.header("ETag", etag);
  }
}

/** --- Handlers --- */

mediaApp.openapi(getPairRoute, async (c) => {
  const { contentContext } = c.req.valid("param");

  if (!contentContextRegex.test(contentContext)) {
    return c.json({ error: "invalid_input", message: t("admin.media.validation.invalidContext") }, 400);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const pair = await prisma.mediaPair.findUnique({
      where: { contentContext },
      include: { lightAsset: true, darkAsset: true },
    });

    if (!pair) {
      return c.json({ error: "not_found", message: t("admin.media.pair.notFound") }, 404);
    }

    // Do not serve pairs where either asset is archived or not accepted
    if (
      pair.lightAsset.archivedAt !== null ||
      pair.darkAsset.archivedAt !== null ||
      pair.lightAsset.reviewStatus !== "accepted" ||
      pair.darkAsset.reviewStatus !== "accepted"
    ) {
      return c.json({ error: "not_found", message: t("admin.media.pair.notFound") }, 404);
    }

    setCacheHeaders(c, pair.updatedAt);

    return c.json({
      id: pair.id,
      contentContext: pair.contentContext,
      light: mapPublicAsset(pair.lightAsset as unknown as MediaAssetRow),
      dark: mapPublicAsset(pair.darkAsset as unknown as MediaAssetRow),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

mediaApp.openapi(batchPairsRoute, async (c) => {
  const { contexts } = c.req.valid("query");

  if (!contexts) {
    return c.json({ pairs: {} }, 200);
  }

  const contextList = contexts.split(",").map((s) => s.trim()).filter(Boolean);

  // Validate all contexts
  for (const ctx of contextList) {
    if (!contentContextRegex.test(ctx)) {
      return c.json({ error: "invalid_input", message: t("admin.media.validation.invalidContext") }, 400);
    }
  }

  if (contextList.length === 0) {
    return c.json({ pairs: {} }, 200);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const pairs = await prisma.mediaPair.findMany({
      where: { contentContext: { in: contextList } },
      include: { lightAsset: true, darkAsset: true },
    });

    const result: Record<string, unknown> = {};
    for (const pair of pairs) {
      // Skip pairs where either asset is archived or not accepted
      if (
        pair.lightAsset.archivedAt !== null ||
        pair.darkAsset.archivedAt !== null ||
        pair.lightAsset.reviewStatus !== "accepted" ||
        pair.darkAsset.reviewStatus !== "accepted"
      ) {
        continue;
      }
      result[pair.contentContext] = {
        id: pair.id,
        contentContext: pair.contentContext,
        light: mapPublicAsset(pair.lightAsset as unknown as MediaAssetRow),
        dark: mapPublicAsset(pair.darkAsset as unknown as MediaAssetRow),
      };
    }

    setCacheHeaders(c);

    return c.json({ pairs: result }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

mediaApp.openapi(getAssetRoute, async (c) => {
  const { id } = c.req.valid("param");

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id, archivedAt: null, reviewStatus: "accepted" },
    });

    if (!asset) {
      return c.json({ error: "not_found", message: t("admin.media.asset.notFound") }, 404);
    }

    setCacheHeaders(c, asset.updatedAt);

    return c.json(mapPublicAsset(asset as unknown as MediaAssetRow), 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
