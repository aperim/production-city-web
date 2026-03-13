/**
 * Download media from Pexels + create sidecar metadata file.
 * Executable via: node --experimental-transform-types --experimental-detect-module scripts/media/pexels-download.ts
 */

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, basename, join } from "node:path";
import { createSidecarFromPhoto, computeChecksum } from "./lib/sidecar.js";
import type { PexelsPhoto, SidecarMetadata } from "./lib/types.js";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "./lib/types.js";

/** JPEG, PNG, WebP magic byte signatures */
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xFF, 0xD8, 0xFF],
  "image/png": [0x89, 0x50, 0x4E, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF header
};

function detectMimeType(buffer: Buffer): string | null {
  for (const [mime, magic] of Object.entries(MAGIC_BYTES)) {
    if (magic.every((byte, i) => buffer[i] === byte)) return mime;
  }
  return null;
}

type FetchFn = typeof globalThis.fetch;

interface DownloadOptions {
  outputPath: string;
  size: "original" | "large2x" | "large" | "medium" | "small";
  sourcingPrompt: string;
  contentContext: string;
  themeVariant: "light" | "dark" | "universal";
  fetchFn?: FetchFn;
  existingChecksum?: string;
}

interface DownloadResult {
  localPath: string;
  sidecarPath: string;
  checksum: string;
  skipped: boolean;
  sidecar: SidecarMetadata;
}

/**
 * Download a Pexels photo to the specified path and create a sidecar metadata file.
 * Skips download if file exists with matching checksum.
 */
export async function downloadPhoto(
  photo: PexelsPhoto,
  options: DownloadOptions,
): Promise<DownloadResult> {
  const fetchFn = options.fetchFn ?? globalThis.fetch;
  const dir = dirname(options.outputPath);
  const base = basename(options.outputPath, ".jpg")
    .replace(/\.jpeg$/, "")
    .replace(/\.png$/, "")
    .replace(/\.webp$/, "");
  const sidecarPath = join(dir, `${base}.meta.json`);

  // Skip if file exists with matching checksum
  if (options.existingChecksum && existsSync(options.outputPath)) {
    const currentChecksum = computeChecksum(options.outputPath);
    if (currentChecksum === options.existingChecksum) {
      const sidecar = createSidecarFromPhoto(photo, {
        localPath: options.outputPath,
        checksum: currentChecksum,
        downloadedSize: options.size,
        sourcingPrompt: options.sourcingPrompt,
        contentContext: options.contentContext,
        themeVariant: options.themeVariant,
      });
      return {
        localPath: options.outputPath,
        sidecarPath,
        checksum: currentChecksum,
        skipped: true,
        sidecar,
      };
    }
  }

  // Ensure output directory exists
  mkdirSync(dir, { recursive: true });

  // Download the file
  const downloadUrl = photo.src[options.size] ?? photo.src.original;
  const response = await fetchFn(downloadUrl);

  if (!response.ok) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`,
    );
  }

  // Validate content-length before buffering
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
    throw new Error(
      `File too large: ${contentLength} bytes exceeds ${MAX_FILE_SIZE} byte limit`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  // Enforce max file size after download
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(
      `File too large: ${buffer.length} bytes exceeds ${MAX_FILE_SIZE} byte limit`,
    );
  }

  // Validate MIME type via magic bytes (raster only — no SVG)
  const detectedMime = detectMimeType(buffer);
  if (!detectedMime || !ALLOWED_MIME_TYPES.includes(detectedMime as typeof ALLOWED_MIME_TYPES[number])) {
    throw new Error(
      `Invalid file type: detected ${detectedMime ?? "unknown"}. Only ${ALLOWED_MIME_TYPES.join(", ")} allowed.`,
    );
  }

  // Write file
  writeFileSync(options.outputPath, buffer);

  // Compute checksum
  const checksum = computeChecksum(options.outputPath);

  // Create sidecar
  const sidecar = createSidecarFromPhoto(photo, {
    localPath: options.outputPath,
    checksum,
    downloadedSize: options.size,
    sourcingPrompt: options.sourcingPrompt,
    contentContext: options.contentContext,
    themeVariant: options.themeVariant,
  });

  writeFileSync(sidecarPath, JSON.stringify(sidecar, null, 2));

  return {
    localPath: options.outputPath,
    sidecarPath,
    checksum,
    skipped: false,
    sidecar,
  };
}
