/**
 * Orchestrate real media sourcing from Pexels for all 23 content contexts.
 * Self-contained — no local imports to avoid module resolution issues with Node type stripping.
 *
 * Usage: PEXELS_TOKEN=<key> node --experimental-transform-types --experimental-detect-module scripts/media/source-all-media.ts
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const PUBLIC_MEDIA = join(import.meta.dirname, "../../apps/web/public/media");
const PEXELS_API_BASE = "https://api.pexels.com";

// ---------- Pexels API types (inline) ----------

interface PexelsPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PexelsPhotoSrc;
  liked: boolean;
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

// ---------- Content contexts ----------

interface ContentContext {
  context: string;
  description: string;
  searchQuery: string;
  altQueries?: string[];
}

const MEDIA_CONTEXTS: ContentContext[] = [
  // Home page
  { context: "home-hero", description: "Grand-scale production facility, cinematic lighting", searchQuery: "film production studio cinematic lighting", altQueries: ["movie set lights camera", "film studio dramatic"] },
  { context: "home-facilities-preview", description: "Sound stage interior, LED volume", searchQuery: "sound stage led wall virtual production", altQueries: ["film set sound stage wide"] },
  { context: "home-creative-preview", description: "Creative professionals collaborating on set", searchQuery: "film crew teamwork on set", altQueries: ["creative team video production"] },
  { context: "home-vision-preview", description: "Global city skylines or modern campus", searchQuery: "modern city skyline aerial", altQueries: ["futuristic architecture campus"] },
  // Facilities page
  { context: "facilities-hero", description: "Large-scale sound stage, dramatic perspective", searchQuery: "large sound stage dramatic lighting", altQueries: ["empty film set wide angle"] },
  { context: "facilities-screen-stage", description: "Film production on a sound stage", searchQuery: "film set production action", altQueries: ["movie set cameras crew"] },
  { context: "facilities-commercial-stage", description: "Compact studio setup, commercial shoot", searchQuery: "commercial photography studio setup", altQueries: ["photo studio lighting equipment"] },
  { context: "facilities-broadcast-theatre", description: "Live performance venue, theatre seats", searchQuery: "theatre auditorium performance venue", altQueries: ["concert hall stage dramatic"] },
  { context: "facilities-control-room", description: "Broadcast control room, monitors, technical equipment", searchQuery: "broadcast control room monitors screens", altQueries: ["video production control room"] },
  { context: "facilities-ancillary", description: "Recording studio or workshop space", searchQuery: "recording studio music production", altQueries: ["audio recording studio professional"] },
  // Creative page
  { context: "creative-hero", description: "Diverse creative team working together", searchQuery: "diverse creative team collaboration", altQueries: ["creative professionals working together"] },
  { context: "creative-vfx", description: "Visual effects / CGI work, green screen", searchQuery: "green screen visual effects production", altQueries: ["vfx studio green screen"] },
  { context: "creative-motion-capture", description: "Motion capture studio, performers", searchQuery: "motion capture suit technology", altQueries: ["motion capture studio performance"] },
  { context: "creative-costume", description: "Costume design, wardrobe department", searchQuery: "costume design wardrobe department", altQueries: ["fashion design studio sewing"] },
  { context: "creative-post-production", description: "Editing suite, color grading", searchQuery: "video editing color grading monitor", altQueries: ["post production editing suite"] },
  // Vision page
  { context: "vision-hero", description: "Futuristic campus or innovation center", searchQuery: "futuristic architecture innovation", altQueries: ["modern building design glass"] },
  { context: "vision-queensland", description: "Sydney, Australia landscape/cityscape", searchQuery: "sydney australia skyline harbour", altQueries: ["sydney opera house harbour bridge"] },
  { context: "vision-global", description: "Global connectivity, world map concept", searchQuery: "global network technology connection", altQueries: ["world map digital connectivity"] },
  // Community page
  { context: "community-hero", description: "Education/learning environment, students", searchQuery: "students learning classroom technology", altQueries: ["education workshop creative learning"] },
  { context: "community-sustainability", description: "Green building, solar panels, nature", searchQuery: "sustainable green building solar panels", altQueries: ["eco friendly architecture nature"] },
  { context: "community-education", description: "University/workshop setting", searchQuery: "university workshop hands on learning", altQueries: ["film school students workshop"] },
  // FAQ page
  { context: "faq-hero", description: "Information desk, welcome, or question concept", searchQuery: "information desk help reception", altQueries: ["customer service professional"] },
  // Contact page
  { context: "contact-hero", description: "Professional meeting, handshake, or conversation", searchQuery: "professional meeting handshake business", altQueries: ["business conversation professional"] },
];

// ---------- Sidecar metadata ----------

interface SidecarMetadata {
  pexelsId: number;
  photographer: string;
  photographerUrl: string;
  photographerId: number;
  pexelsUrl: string;
  source: string;
  sourceUrl: string;
  localPath: string;
  checksum: string;
  contentContext: string;
  themeVariant: "light" | "dark";
  description: string;
  searchQuery: string;
  width: number;
  height: number;
  downloadedSize: string;
  downloadedAt: string;
  alt: string;
  averageColor: string;
  aiGenerated: boolean;
  aiAssisted: boolean;
  hasFirstNationsPermission: boolean;
  culturalNotes: string;
  license: string;
  licenseUrl: string;
  attributionRequired: boolean;
  attributionText: string;
  placeholder: boolean;
}

// ---------- Utilities ----------

function computeChecksum(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function isValidJpeg(buffer: Buffer): boolean {
  return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchPhotos(apiKey: string, query: string, perPage: number = 15): Promise<PexelsSearchResponse> {
  const url = new URL(`${PEXELS_API_BASE}/v1/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("size", "large");

  const response = await fetch(url.toString(), {
    headers: { Authorization: apiKey },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded (429). Wait and retry.");
    }
    throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<PexelsSearchResponse>;
}

// ---------- Core download logic ----------

async function searchAndDownload(
  apiKey: string,
  ctx: ContentContext,
  variant: "light" | "dark",
  usedPhotoIds: Set<number>,
): Promise<boolean> {
  const dir = join(PUBLIC_MEDIA, ctx.context);
  const imgPath = join(dir, `${variant}.jpg`);
  const metaPath = join(dir, `${variant}.meta.json`);

  // Check if already has a real image
  if (existsSync(imgPath) && existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
      if (meta.placeholder === false && meta.pexelsId) {
        console.log(`  SKIP ${ctx.context}/${variant} — already real (pexelsId: ${meta.pexelsId})`);
        usedPhotoIds.add(meta.pexelsId);
        return true;
      }
    } catch {
      // continue to download
    }
  }

  mkdirSync(dir, { recursive: true });

  const queries = [ctx.searchQuery, ...(ctx.altQueries ?? [])];

  for (const query of queries) {
    try {
      const response = await searchPhotos(apiKey, query);

      if (response.photos.length === 0) {
        console.log(`  No results for "${query}", trying next...`);
        await delay(300);
        continue;
      }

      // Filter to wide images, avoid duplicates
      const candidates = response.photos
        .filter((p) => p.width >= 1920 && !usedPhotoIds.has(p.id))
        .sort((a, b) => (b.width * b.height) - (a.width * a.height));

      // Fallback: if all wide images are used, accept narrower ones
      const pool = candidates.length > 0
        ? candidates
        : response.photos.filter((p) => !usedPhotoIds.has(p.id));

      if (pool.length === 0) {
        console.log(`  All photos already used for "${query}", trying next...`);
        await delay(300);
        continue;
      }

      // For variety: dark gets top result, light gets second
      const idx = variant === "dark" ? 0 : Math.min(1, pool.length - 1);
      const photo = pool[idx]!;

      // Download
      const downloadUrl = photo.src.large2x ?? photo.src.original;
      const imgResponse = await fetch(downloadUrl);
      if (!imgResponse.ok) {
        console.error(`  Download failed for ${ctx.context}/${variant}: ${imgResponse.status}`);
        continue;
      }

      const buffer = Buffer.from(await imgResponse.arrayBuffer());

      if (!isValidJpeg(buffer)) {
        console.error(`  Invalid JPEG for ${ctx.context}/${variant}, skipping`);
        continue;
      }

      writeFileSync(imgPath, buffer);
      usedPhotoIds.add(photo.id);

      const checksum = computeChecksum(buffer);
      const sidecar: SidecarMetadata = {
        pexelsId: photo.id,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        photographerId: photo.photographer_id,
        pexelsUrl: photo.url,
        source: "Pexels",
        sourceUrl: "https://www.pexels.com",
        localPath: `public/media/${ctx.context}/${variant}.jpg`,
        checksum,
        contentContext: ctx.context,
        themeVariant: variant,
        description: ctx.description,
        searchQuery: query,
        width: photo.width,
        height: photo.height,
        downloadedSize: "large2x",
        downloadedAt: new Date().toISOString(),
        alt: photo.alt || ctx.description,
        averageColor: photo.avg_color,
        aiGenerated: false,
        aiAssisted: false,
        hasFirstNationsPermission: false,
        culturalNotes: "",
        license: "Pexels License — free for personal and commercial use",
        licenseUrl: "https://www.pexels.com/license/",
        attributionRequired: false,
        attributionText: `Photo by ${photo.photographer} on Pexels`,
        placeholder: false,
      };

      writeFileSync(metaPath, JSON.stringify(sidecar, null, 2));

      console.log(`  OK ${ctx.context}/${variant} — pexelsId: ${photo.id}, ${photo.photographer}, ${(buffer.length / 1024).toFixed(0)}KB`);
      return true;
    } catch (err) {
      console.error(`  ERROR ${ctx.context}/${variant} query="${query}":`, (err as Error).message);
    }
  }

  return false;
}

// ---------- Main ----------

async function main(): Promise<void> {
  const apiKey = process.env.PEXELS_TOKEN;
  if (!apiKey) {
    console.error("PEXELS_TOKEN environment variable is required");
    process.exit(1);
  }

  const usedPhotoIds = new Set<number>();
  let success = 0;
  let failed = 0;
  const total = MEDIA_CONTEXTS.length * 2;

  console.log(`Sourcing real media for ${MEDIA_CONTEXTS.length} contexts (${total} images)...\n`);

  for (const ctx of MEDIA_CONTEXTS) {
    console.log(`[${ctx.context}]`);

    for (const variant of ["dark", "light"] as const) {
      const ok = await searchAndDownload(apiKey, ctx, variant, usedPhotoIds);
      if (ok) {
        success++;
      } else {
        failed++;
        console.error(`  FAILED ${ctx.context}/${variant}`);
      }
      // Rate limit between API calls
      await delay(400);
    }

    console.log("");
  }

  console.log(`\nDone: ${success}/${total} succeeded, ${failed} failed`);
  console.log(`Unique photos used: ${usedPhotoIds.size}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
