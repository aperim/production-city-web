/**
 * Media asset seed script — reads .meta.json sidecar files and upserts MediaAsset records.
 * Idempotent: safe to re-run.
 */

import type { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

interface SeedSummary {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

interface SidecarData {
  source?: string;
  pexelsId?: number;
  photographer?: string;
  photographerUrl?: string;
  photographerId?: number;
  originalWidth?: number;
  originalHeight?: number;
  averageColor?: string;
  alt?: string;
  originalAlt?: string;
  pexelsUrl?: string;
  downloadUrl?: string;
  downloadedAt?: string;
  localPath?: string;
  publicPath?: string;
  checksum?: string;
  license?: string;
  attributionRequired?: boolean;
  attributionText?: string;
  aiAssisted?: boolean;
  aiGenerated?: boolean;
  hasFirstNationsPermission?: boolean;
  culturalNotes?: string | null;
  themeVariant?: string;
  contentContext?: string;
  sourcingAgent?: string;
  sourcingPrompt?: string;
  reviewStatus?: string;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  mimeType?: string;
  fileSize?: number;
  pairedWith?: string | null;
}

interface MediaAssetData {
  source: string;
  externalId: string;
  externalUrl: string | null;
  photographer: string;
  photographerUrl: string | null;
  photographerId: string | null;
  originalWidth: number;
  originalHeight: number;
  averageColor: string | null;
  alt: string;
  originalAlt: string | null;
  mimeType: string;
  fileSize: number | null;
  checksum: string | null;
  localPath: string;
  publicPath: string;
  downloadUrl: string | null;
  license: string;
  attributionRequired: boolean;
  attributionText: string | null;
  aiAssisted: boolean;
  aiGenerated: boolean;
  hasFirstNationsPermission: boolean;
  culturalNotes: string | null;
  themeVariant: string;
  contentContext: string | null;
  sourcingAgent: string | null;
  sourcingPrompt: string | null;
  reviewStatus: string;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  downloadedAt: Date | null;
}

/**
 * Parse a sidecar metadata object into MediaAsset fields.
 */
export function parseSidecarToMediaAsset(meta: SidecarData): MediaAssetData {
  const localPath = meta.localPath ?? "";
  // Derive publicPath: strip "public" prefix to get the served path
  const publicPath =
    meta.publicPath ?? localPath.replace(/^public\//, "/").replace(/^\/\//, "/");

  return {
    source: meta.source ?? "pexels",
    externalId: String(meta.pexelsId ?? ""),
    externalUrl: meta.pexelsUrl ?? null,
    photographer: meta.photographer ?? "Unknown",
    photographerUrl: meta.photographerUrl ?? null,
    photographerId: meta.photographerId != null ? String(meta.photographerId) : null,
    originalWidth: meta.originalWidth ?? 0,
    originalHeight: meta.originalHeight ?? 0,
    averageColor: meta.averageColor ?? null,
    alt: meta.alt ?? "",
    originalAlt: meta.originalAlt ?? null,
    mimeType: meta.mimeType ?? "image/jpeg",
    fileSize: meta.fileSize ?? null,
    checksum: meta.checksum ?? null,
    localPath,
    publicPath,
    downloadUrl: meta.downloadUrl ?? null,
    license: meta.license ?? "pexels",
    attributionRequired: meta.attributionRequired ?? true,
    attributionText: meta.attributionText ?? null,
    aiAssisted: meta.aiAssisted ?? false,
    aiGenerated: meta.aiGenerated ?? false,
    hasFirstNationsPermission: meta.hasFirstNationsPermission ?? false,
    culturalNotes: meta.culturalNotes ?? null,
    themeVariant: meta.themeVariant ?? "universal",
    contentContext: meta.contentContext ?? null,
    sourcingAgent: meta.sourcingAgent ?? null,
    sourcingPrompt: meta.sourcingPrompt ?? null,
    reviewStatus: meta.reviewStatus ?? "pending",
    reviewNotes: meta.reviewNotes ?? null,
    reviewedAt: meta.reviewedAt ? new Date(meta.reviewedAt) : null,
    downloadedAt: meta.downloadedAt ? new Date(meta.downloadedAt) : null,
  };
}

/**
 * Recursively find all .meta.json files in a directory.
 */
function findSidecarFiles(dir: string): string[] {
  const results: string[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    try {
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...findSidecarFiles(fullPath));
      } else if (entry.endsWith(".meta.json")) {
        results.push(fullPath);
      }
    } catch {
      // skip inaccessible entries
    }
  }

  return results;
}

/**
 * Seed MediaAsset records from .meta.json sidecar files.
 * Idempotent: uses upsert keyed on (source, externalId).
 */
export async function seedMediaAssets(
  prisma: PrismaClient,
  mediaDir: string,
): Promise<SeedSummary> {
  const summary: SeedSummary = { created: 0, updated: 0, skipped: 0, errors: 0 };

  const sidecarFiles = findSidecarFiles(mediaDir);
  console.log(`[media-seed] Found ${sidecarFiles.length} sidecar files in ${mediaDir}`);

  for (const file of sidecarFiles) {
    let meta: SidecarData;
    try {
      const content = readFileSync(file, "utf-8");
      meta = JSON.parse(content) as SidecarData;
    } catch (err) {
      console.warn(`[media-seed] Skipping invalid sidecar: ${file} — ${err}`);
      summary.skipped++;
      continue;
    }

    // Validate minimum required fields
    if (!meta.source || !meta.pexelsId || !meta.photographer || !meta.alt || !meta.localPath || !meta.license) {
      console.warn(`[media-seed] Skipping sidecar with missing required fields: ${file}`);
      summary.skipped++;
      continue;
    }

    try {
      const data = parseSidecarToMediaAsset(meta);
      const existing = await prisma.mediaAsset.findUnique({
        where: {
          source_externalId: {
            source: data.source,
            externalId: data.externalId,
          },
        },
      });

      if (existing) {
        await prisma.mediaAsset.update({
          where: { id: existing.id },
          data,
        });
        summary.updated++;
      } else {
        await prisma.mediaAsset.create({ data });
        summary.created++;
      }
    } catch (err) {
      console.error(`[media-seed] Error processing ${file}: ${err}`);
      summary.errors++;
    }
  }

  console.log(
    `[media-seed] Summary: ${summary.created} created, ${summary.updated} updated, ${summary.skipped} skipped, ${summary.errors} errors`,
  );
  return summary;
}
