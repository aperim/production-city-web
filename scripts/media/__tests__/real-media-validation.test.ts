/**
 * TDD tests for real media sourcing — validates that all 23 content contexts
 * have real Pexels photographs replacing the 151-byte placeholders.
 *
 * These tests verify acceptance criteria for issue #237.
 */

import { describe, test, expect } from "vitest";
import { readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const PUBLIC_MEDIA = join(import.meta.dirname, "../../../apps/web/public/media");

/** All 23 content contexts that need real images */
const CONTENT_CONTEXTS = [
  "home-hero",
  "home-facilities-preview",
  "home-creative-preview",
  "home-vision-preview",
  "facilities-hero",
  "facilities-screen-stage",
  "facilities-commercial-stage",
  "facilities-broadcast-theatre",
  "facilities-control-room",
  "facilities-ancillary",
  "creative-hero",
  "creative-vfx",
  "creative-motion-capture",
  "creative-costume",
  "creative-post-production",
  "vision-hero",
  "vision-queensland",
  "vision-global",
  "community-hero",
  "community-sustainability",
  "community-education",
  "faq-hero",
  "contact-hero",
] as const;

const VARIANTS = ["light", "dark"] as const;

/** JPEG magic bytes: FF D8 FF */
function isValidJpeg(buffer: Buffer): boolean {
  return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
}

describe("Real media validation — all 23 contexts", () => {
  for (const context of CONTENT_CONTEXTS) {
    for (const variant of VARIANTS) {
      const imgPath = join(PUBLIC_MEDIA, context, `${variant}.jpg`);
      const metaPath = join(PUBLIC_MEDIA, context, `${variant}.meta.json`);

      describe(`${context}/${variant}`, () => {
        test("image file exists and is > 10KB (not a placeholder)", () => {
          expect(existsSync(imgPath), `Missing: ${imgPath}`).toBe(true);
          const stat = statSync(imgPath);
          expect(stat.size).toBeGreaterThan(10_000);
        });

        test("image is a valid JPEG", () => {
          const buffer = readFileSync(imgPath);
          expect(isValidJpeg(buffer)).toBe(true);
        });

        test("metadata file exists", () => {
          expect(existsSync(metaPath), `Missing: ${metaPath}`).toBe(true);
        });

        test("metadata has placeholder: false", () => {
          const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
          expect(meta.placeholder).toBe(false);
        });

        test("metadata has non-null pexelsId", () => {
          const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
          expect(meta.pexelsId).not.toBeNull();
          expect(typeof meta.pexelsId).toBe("number");
          expect(meta.pexelsId).toBeGreaterThan(0);
        });

        test("metadata has non-empty photographer", () => {
          const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
          expect(meta.photographer).toBeTruthy();
          expect(meta.photographer).not.toBe("Placeholder");
        });

        test("metadata has license info", () => {
          const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
          expect(meta.license).toBeTruthy();
        });
      });
    }
  }

  test("total context count is 23", () => {
    expect(CONTENT_CONTEXTS.length).toBe(23);
  });
});
