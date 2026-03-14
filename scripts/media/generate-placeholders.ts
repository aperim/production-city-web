/**
 * Generate placeholder media files for all content contexts.
 * Creates minimal JPEG files + sidecar metadata for development.
 *
 * Usage: node --experimental-transform-types --experimental-detect-module scripts/media/generate-placeholders.ts
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

interface MediaContext {
  context: string;
  description: string;
  searchQuery: string;
}

/** All content contexts needed across the site */
const MEDIA_CONTEXTS: MediaContext[] = [
  // Home page
  { context: "home-hero", description: "Grand-scale production facility, cinematic lighting", searchQuery: "film production studio cinematic" },
  { context: "home-facilities-preview", description: "Sound stage interior, LED volume", searchQuery: "sound stage led volume" },
  { context: "home-creative-preview", description: "Creative professionals collaborating on set", searchQuery: "creative team film production" },
  { context: "home-vision-preview", description: "Global city skylines or modern campus", searchQuery: "modern campus skyline" },
  // Facilities page
  { context: "facilities-hero", description: "Large-scale sound stage, dramatic perspective", searchQuery: "sound stage dramatic lighting" },
  { context: "facilities-screen-stage", description: "Film production on a sound stage", searchQuery: "film set sound stage" },
  { context: "facilities-commercial-stage", description: "Compact studio setup, commercial shoot", searchQuery: "commercial photography studio" },
  { context: "facilities-broadcast-theatre", description: "Live performance venue, theatre seats", searchQuery: "theatre performance venue" },
  { context: "facilities-control-room", description: "Broadcast control room, monitors, technical equipment", searchQuery: "broadcast control room monitors" },
  { context: "facilities-ancillary", description: "Recording studio or workshop space", searchQuery: "recording studio workshop" },
  // Creative page
  { context: "creative-hero", description: "Diverse creative team working together", searchQuery: "diverse creative team" },
  { context: "creative-vfx", description: "Visual effects / CGI work, green screen", searchQuery: "visual effects green screen" },
  { context: "creative-motion-capture", description: "Motion capture studio, performers", searchQuery: "motion capture studio" },
  { context: "creative-costume", description: "Costume design, wardrobe department", searchQuery: "costume design wardrobe" },
  { context: "creative-post-production", description: "Editing suite, color grading", searchQuery: "video editing color grading" },
  // Vision page
  { context: "vision-hero", description: "Futuristic campus or innovation center", searchQuery: "modern innovation center" },
  { context: "vision-queensland", description: "Queensland, Australia landscape/cityscape", searchQuery: "queensland australia coastline" },
  { context: "vision-global", description: "Global connectivity, world map concept", searchQuery: "global network connection" },
  // Community page
  { context: "community-hero", description: "Education/learning environment, students", searchQuery: "education learning environment" },
  { context: "community-sustainability", description: "Green building, solar panels, nature", searchQuery: "sustainable building solar" },
  { context: "community-education", description: "University/workshop setting", searchQuery: "university workshop students" },
  // FAQ page
  { context: "faq-hero", description: "Information desk, welcome, or question concept", searchQuery: "information help desk" },
  // Contact page
  { context: "contact-hero", description: "Professional meeting, handshake, or conversation", searchQuery: "professional meeting conversation" },
];

/**
 * Minimal 1x1 JPEG file as a Buffer.
 * This is the smallest valid JPEG possible.
 */
function createMinimalJpeg(variant: "light" | "dark"): Buffer {
  // Minimal valid JPEG: SOI + APP0 + DQT + SOF + DHT + SOS + image data + EOI
  // This creates a valid 1x1 pixel JPEG
  const pixelValue = variant === "light" ? 0xE0 : 0x20;
  return Buffer.from([
    0xFF, 0xD8, // SOI
    0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, // APP0 JFIF
    0xFF, 0xDB, 0x00, 0x43, 0x00, // DQT marker
    0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12, 0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, // quantization table
    0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, // SOF0 1x1 grayscale
    0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, // DHT DC
    0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x7A, 0x34, // SOS
    pixelValue, 0x3F, // image data
    0xFF, 0xD9, // EOI
  ]);
}

interface SidecarMetadata {
  pexelsId: number | null;
  photographer: string;
  photographerUrl: string;
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
  aiGenerated: boolean;
  aiAssisted: boolean;
  hasFirstNationsPermission: boolean;
  culturalNotes: string;
  license: string;
  placeholder: boolean;
}

function createSidecar(
  context: string,
  variant: "light" | "dark",
  description: string,
  searchQuery: string,
  localPath: string,
  checksum: string,
): SidecarMetadata {
  return {
    pexelsId: null,
    photographer: "Placeholder",
    photographerUrl: "",
    pexelsUrl: "",
    source: "Pexels",
    sourceUrl: "https://www.pexels.com",
    localPath,
    checksum,
    contentContext: context,
    themeVariant: variant,
    description,
    searchQuery,
    width: 1920,
    height: 1080,
    downloadedSize: "placeholder",
    aiGenerated: false,
    aiAssisted: false,
    hasFirstNationsPermission: false,
    culturalNotes: "",
    license: "Pexels License — free for personal and commercial use",
    placeholder: true,
  };
}

// Main
const PUBLIC_MEDIA = join(import.meta.dirname, "../../apps/web/public/media");

let created = 0;
let skipped = 0;

for (const ctx of MEDIA_CONTEXTS) {
  for (const variant of ["light", "dark"] as const) {
    const dir = join(PUBLIC_MEDIA, ctx.context);
    const filename = `${variant}.jpg`;
    const filepath = join(dir, filename);
    const sidecarPath = join(dir, `${variant}.meta.json`);

    if (existsSync(filepath) && existsSync(sidecarPath)) {
      skipped++;
      continue;
    }

    mkdirSync(dir, { recursive: true });

    const jpeg = createMinimalJpeg(variant);
    writeFileSync(filepath, jpeg);

    const checksum = createHash("sha256").update(jpeg).digest("hex");

    const sidecar = createSidecar(
      ctx.context,
      variant,
      ctx.description,
      ctx.searchQuery,
      `public/media/${ctx.context}/${filename}`,
      checksum,
    );

    writeFileSync(sidecarPath, JSON.stringify(sidecar, null, 2));
    created++;
  }
}

console.log(`Media placeholders: ${created} created, ${skipped} skipped`);
console.log(`Total contexts: ${MEDIA_CONTEXTS.length}`);
console.log(`Total files: ${MEDIA_CONTEXTS.length * 2} images + ${MEDIA_CONTEXTS.length * 2} sidecars`);
