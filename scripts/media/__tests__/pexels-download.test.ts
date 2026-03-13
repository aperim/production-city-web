import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { existsSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { downloadPhoto } from "../pexels-download.js";
import type { PexelsPhoto } from "../lib/types.js";

const TMP_DIR = `/tmp/download-test-${Date.now()}`;

function makePhoto(overrides: Partial<PexelsPhoto> = {}): PexelsPhoto {
  return {
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
    ...overrides,
  };
}

describe("downloadPhoto", () => {
  beforeEach(() => {
    mkdirSync(TMP_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TMP_DIR, { recursive: true, force: true });
  });

  it("downloads file to specified path", async () => {
    const fileContent = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG magic bytes
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        "content-type": "image/jpeg",
        "content-length": String(fileContent.length),
      }),
      arrayBuffer: () => Promise.resolve(fileContent.buffer),
    });

    const outputPath = join(TMP_DIR, "test.jpg");
    const result = await downloadPhoto(makePhoto(), {
      outputPath,
      size: "original",
      sourcingPrompt: "test",
      contentContext: "hero",
      themeVariant: "dark" as const,
      fetchFn: mockFetch,
    });

    expect(existsSync(outputPath)).toBe(true);
    expect(result.localPath).toBe(outputPath);
  });

  it("creates sidecar file alongside downloaded media", async () => {
    const fileContent = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        "content-type": "image/jpeg",
        "content-length": String(fileContent.length),
      }),
      arrayBuffer: () => Promise.resolve(fileContent.buffer),
    });

    const outputPath = join(TMP_DIR, "test.jpg");
    await downloadPhoto(makePhoto(), {
      outputPath,
      size: "original",
      sourcingPrompt: "test",
      contentContext: "hero",
      themeVariant: "dark" as const,
      fetchFn: mockFetch,
    });

    const sidecarPath = join(TMP_DIR, "test.meta.json");
    expect(existsSync(sidecarPath)).toBe(true);

    const sidecar = JSON.parse(readFileSync(sidecarPath, "utf-8"));
    expect(sidecar.source).toBe("pexels");
    expect(sidecar.pexelsId).toBe(12345);
    expect(sidecar.checksum).toMatch(/^sha256:/);
  });

  it("skips download if file already exists with matching checksum", async () => {
    const fileContent = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        "content-type": "image/jpeg",
        "content-length": String(fileContent.length),
      }),
      arrayBuffer: () => Promise.resolve(fileContent.buffer),
    });

    const outputPath = join(TMP_DIR, "test.jpg");

    // First download
    const result1 = await downloadPhoto(makePhoto(), {
      outputPath,
      size: "original",
      sourcingPrompt: "test",
      contentContext: "hero",
      themeVariant: "dark" as const,
      fetchFn: mockFetch,
    });

    // Second download — should skip
    const result2 = await downloadPhoto(makePhoto(), {
      outputPath,
      size: "original",
      sourcingPrompt: "test",
      contentContext: "hero",
      themeVariant: "dark" as const,
      fetchFn: mockFetch,
      existingChecksum: result1.checksum,
    });

    expect(result2.skipped).toBe(true);
    // fetch should only have been called once (the first download)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("handles network errors gracefully", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const outputPath = join(TMP_DIR, "test.jpg");
    await expect(
      downloadPhoto(makePhoto(), {
        outputPath,
        size: "original",
        sourcingPrompt: "test",
        contentContext: "hero",
        themeVariant: "dark" as const,
        fetchFn: mockFetch,
      }),
    ).rejects.toThrow(/Network error/);
  });
});
