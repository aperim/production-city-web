import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createSidecarFromPhoto,
  validateSidecar,
  readSidecar,
  updateSidecar,
  computeChecksum,
} from "../lib/sidecar.js";
import type { PexelsPhoto, SidecarMetadata } from "../lib/types.js";

const MOCK_PHOTO: PexelsPhoto = {
  id: 12345,
  width: 4000,
  height: 2667,
  url: "https://www.pexels.com/photo/test-12345/",
  photographer: "Jane Doe",
  photographer_url: "https://www.pexels.com/@janedoe",
  photographer_id: 67890,
  avg_color: "#2A3B4C",
  src: {
    original: "https://images.pexels.com/photos/12345/original.jpeg",
    large2x: "https://images.pexels.com/photos/12345/large2x.jpeg",
    large: "https://images.pexels.com/photos/12345/large.jpeg",
    medium: "https://images.pexels.com/photos/12345/medium.jpeg",
    small: "https://images.pexels.com/photos/12345/small.jpeg",
    portrait: "https://images.pexels.com/photos/12345/portrait.jpeg",
    landscape: "https://images.pexels.com/photos/12345/landscape.jpeg",
    tiny: "https://images.pexels.com/photos/12345/tiny.jpeg",
  },
  liked: false,
  alt: "Modern film studio interior",
};

const TMP_DIR = `/tmp/sidecar-test-${Date.now()}`;

describe("Sidecar", () => {
  beforeEach(() => {
    mkdirSync(TMP_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
  });

  describe("createSidecarFromPhoto", () => {
    it("creates valid sidecar JSON from Pexels photo response", () => {
      const sidecar = createSidecarFromPhoto(MOCK_PHOTO, {
        localPath: "public/media/hero/hero-dark.jpg",
        checksum: "sha256:abc123",
        downloadedSize: "original",
        sourcingPrompt: "film studio interior",
        contentContext: "hero-studio",
        themeVariant: "dark",
      });

      expect(sidecar.source).toBe("pexels");
      expect(sidecar.pexelsId).toBe(12345);
      expect(sidecar.photographer).toBe("Jane Doe");
      expect(sidecar.photographerUrl).toBe("https://www.pexels.com/@janedoe");
      expect(sidecar.photographerId).toBe(67890);
      expect(sidecar.originalWidth).toBe(4000);
      expect(sidecar.originalHeight).toBe(2667);
      expect(sidecar.averageColor).toBe("#2A3B4C");
      expect(sidecar.alt).toBe("Modern film studio interior");
      expect(sidecar.localPath).toBe("public/media/hero/hero-dark.jpg");
      expect(sidecar.license).toBe("pexels");
      expect(sidecar.attributionRequired).toBe(true);
      expect(sidecar.themeVariant).toBe("dark");
      expect(sidecar.contentContext).toBe("hero-studio");
      expect(sidecar.reviewStatus).toBe("pending");
    });
  });

  describe("validateSidecar", () => {
    it("validates complete sidecar as valid", () => {
      const sidecar = createSidecarFromPhoto(MOCK_PHOTO, {
        localPath: "public/media/hero/hero-dark.jpg",
        checksum: "sha256:abc123",
        downloadedSize: "original",
        sourcingPrompt: "film studio",
        contentContext: "hero",
        themeVariant: "dark",
      });

      const result = validateSidecar(sidecar);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects sidecar missing required fields", () => {
      const partial = { source: "pexels" } as unknown as SidecarMetadata;
      const result = validateSidecar(partial);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("readSidecar", () => {
    it("reads existing sidecar and returns typed object", () => {
      const sidecar = createSidecarFromPhoto(MOCK_PHOTO, {
        localPath: "public/media/hero/hero-dark.jpg",
        checksum: "sha256:abc123",
        downloadedSize: "original",
        sourcingPrompt: "film studio",
        contentContext: "hero",
        themeVariant: "dark",
      });

      const filePath = join(TMP_DIR, "test.meta.json");
      writeFileSync(filePath, JSON.stringify(sidecar, null, 2));

      const loaded = readSidecar(filePath);
      expect(loaded.pexelsId).toBe(12345);
      expect(loaded.photographer).toBe("Jane Doe");
    });
  });

  describe("updateSidecar", () => {
    it("updates sidecar fields (review status, pairing)", () => {
      const sidecar = createSidecarFromPhoto(MOCK_PHOTO, {
        localPath: "public/media/hero/hero-dark.jpg",
        checksum: "sha256:abc123",
        downloadedSize: "original",
        sourcingPrompt: "film studio",
        contentContext: "hero",
        themeVariant: "dark",
      });

      const filePath = join(TMP_DIR, "test.meta.json");
      writeFileSync(filePath, JSON.stringify(sidecar, null, 2));

      updateSidecar(filePath, {
        reviewStatus: "accepted",
        reviewNotes: "Good composition",
        pairedWith: "hero-light.jpg",
      });

      const updated = JSON.parse(readFileSync(filePath, "utf-8"));
      expect(updated.reviewStatus).toBe("accepted");
      expect(updated.reviewNotes).toBe("Good composition");
      expect(updated.pairedWith).toBe("hero-light.jpg");
    });
  });

  describe("computeChecksum", () => {
    it("computes SHA-256 checksum of file", () => {
      const filePath = join(TMP_DIR, "test.bin");
      writeFileSync(filePath, "hello world");

      const checksum = computeChecksum(filePath);
      expect(checksum).toMatch(/^sha256:[a-f0-9]{64}$/);
      // Known SHA-256 of "hello world"
      expect(checksum).toBe(
        "sha256:b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
      );
    });
  });
});
