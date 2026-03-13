import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import { seedMediaAssets, parseSidecarToMediaAsset } from "../../media-seed.js";

const ROOT = resolve(import.meta.dirname, "../../..");
const MIGRATION_0 = readFileSync(
  resolve(ROOT, "prisma/migrations/0000_baseline.sql"),
  "utf-8",
);
const MIGRATION_1 = readFileSync(
  resolve(ROOT, "prisma/migrations/0001_rbac_schema.sql"),
  "utf-8",
);
const MIGRATION_2 = readFileSync(
  resolve(ROOT, "prisma/migrations/0002_add_media_asset.sql"),
  "utf-8",
);

function createTestPrisma() {
  const tmpFile = `/tmp/test-media-${Date.now()}-${Math.random().toString(36).slice(2)}.db`;
  const sqliteDb = new Database(tmpFile);
  sqliteDb.pragma("journal_mode = WAL");
  sqliteDb.pragma("foreign_keys = ON");
  sqliteDb.exec(MIGRATION_0);
  sqliteDb.exec(MIGRATION_1);
  sqliteDb.exec(MIGRATION_2);
  sqliteDb.close();

  const adapter = new PrismaBetterSqlite3({ url: `file:${tmpFile}` });
  const prisma = new PrismaClient({ adapter });
  return { prisma, tmpFile };
}

const VALID_SIDECAR = {
  source: "pexels",
  pexelsId: 12345,
  pexelsUrl: "https://www.pexels.com/photo/test-12345/",
  photographer: "Jane Doe",
  photographerUrl: "https://www.pexels.com/@janedoe",
  photographerId: 67890,
  originalWidth: 4000,
  originalHeight: 2667,
  averageColor: "#2A3B4C",
  alt: "Modern film studio interior",
  downloadUrl: "https://images.pexels.com/photos/12345/original.jpeg",
  downloadedAt: "2026-03-13T10:00:00Z",
  downloadedSize: "original",
  localPath: "public/media/hero/hero-dark.jpg",
  checksum: "sha256:abc123",
  license: "pexels",
  attributionRequired: true,
  attributionText: "Photo by Jane Doe on Pexels",
  aiAssisted: false,
  aiGenerated: false,
  hasFirstNationsPermission: false,
  culturalNotes: null,
  themeVariant: "dark",
  contentContext: "hero-studio",
  pairedWith: null,
  sourcingAgent: "claude-code",
  sourcingPrompt: "film studio interior",
  reviewStatus: "accepted",
  reviewNotes: "Strong composition",
  reviewedAt: "2026-03-13T10:01:00Z",
  reviewConfirmedBy: null,
  mimeType: "image/jpeg",
};

describe("Media Seed", () => {
  const TMP_MEDIA_DIR = `/tmp/media-seed-test-${Date.now()}`;
  let prisma: PrismaClient;
  let tmpFile: string;

  beforeAll(() => {
    mkdirSync(join(TMP_MEDIA_DIR, "hero"), { recursive: true });
    const setup = createTestPrisma();
    prisma = setup.prisma;
    tmpFile = setup.tmpFile;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    rmSync(TMP_MEDIA_DIR, { recursive: true, force: true });
    try {
      rmSync(tmpFile);
    } catch {
      // ignore
    }
  });

  describe("parseSidecarToMediaAsset", () => {
    it("parses valid sidecar file into MediaAsset fields", () => {
      const result = parseSidecarToMediaAsset(VALID_SIDECAR);
      expect(result.source).toBe("pexels");
      expect(result.externalId).toBe("12345");
      expect(result.photographer).toBe("Jane Doe");
      expect(result.alt).toBe("Modern film studio interior");
      expect(result.localPath).toBe("public/media/hero/hero-dark.jpg");
      expect(result.publicPath).toBe("/media/hero/hero-dark.jpg");
      expect(result.license).toBe("pexels");
    });

    it("handles missing optional fields gracefully", () => {
      const minimal = {
        ...VALID_SIDECAR,
        averageColor: undefined,
        culturalNotes: undefined,
        reviewNotes: undefined,
      };
      const result = parseSidecarToMediaAsset(minimal);
      expect(result.averageColor).toBeNull();
      expect(result.culturalNotes).toBeNull();
      expect(result.reviewNotes).toBeNull();
    });
  });

  describe("seedMediaAssets", () => {
    it("upserts MediaAsset records from sidecar files", async () => {
      writeFileSync(
        join(TMP_MEDIA_DIR, "hero", "hero-dark.meta.json"),
        JSON.stringify(VALID_SIDECAR),
      );

      const summary = await seedMediaAssets(prisma, TMP_MEDIA_DIR);

      expect(summary.created).toBe(1);
      expect(summary.errors).toBe(0);

      const asset = await prisma.mediaAsset.findFirst({
        where: { source: "pexels", externalId: "12345" },
      });
      expect(asset).not.toBeNull();
      expect(asset?.photographer).toBe("Jane Doe");
    });

    it("is idempotent — running twice produces same result", async () => {
      const summary1 = await seedMediaAssets(prisma, TMP_MEDIA_DIR);
      const summary2 = await seedMediaAssets(prisma, TMP_MEDIA_DIR);

      expect(summary2.updated).toBe(summary1.created + (summary1.updated ?? 0));
      expect(summary2.created).toBe(0);

      const count = await prisma.mediaAsset.count();
      expect(count).toBe(1);
    });

    it("skips invalid sidecar files with warning (no crash)", async () => {
      writeFileSync(
        join(TMP_MEDIA_DIR, "hero", "bad.meta.json"),
        "{ invalid json",
      );

      const summary = await seedMediaAssets(prisma, TMP_MEDIA_DIR);
      expect(summary.skipped).toBeGreaterThan(0);
    });

    it("reports summary counts", async () => {
      const summary = await seedMediaAssets(prisma, TMP_MEDIA_DIR);
      expect(summary).toHaveProperty("created");
      expect(summary).toHaveProperty("updated");
      expect(summary).toHaveProperty("skipped");
      expect(summary).toHaveProperty("errors");
    });
  });
});
