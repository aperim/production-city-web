import { describe, it, expect } from "vitest";
import { reviewCandidates } from "../pexels-review.js";
import type { PexelsPhoto } from "../lib/types.js";

function makePhoto(overrides: Partial<PexelsPhoto> = {}): PexelsPhoto {
  return {
    id: 1,
    width: 4000,
    height: 2667,
    url: "https://www.pexels.com/photo/1/",
    photographer: "Test",
    photographer_url: "https://www.pexels.com/@test",
    photographer_id: 1,
    avg_color: "#2A3B4C",
    src: {
      original: "https://images.pexels.com/photos/1/original.jpeg",
      large2x: "https://images.pexels.com/photos/1/large2x.jpeg",
      large: "https://images.pexels.com/photos/1/large.jpeg",
      medium: "https://images.pexels.com/photos/1/medium.jpeg",
      small: "https://images.pexels.com/photos/1/small.jpeg",
      portrait: "https://images.pexels.com/photos/1/portrait.jpeg",
      landscape: "https://images.pexels.com/photos/1/landscape.jpeg",
      tiny: "https://images.pexels.com/photos/1/tiny.jpeg",
    },
    liked: false,
    alt: "A beautiful landscape photo",
    ...overrides,
  };
}

describe("reviewCandidates", () => {
  it("accepts images meeting quality threshold", () => {
    const photos = [makePhoto({ id: 1, width: 4000, height: 2667 })];
    const results = reviewCandidates(photos, { minWidth: 1920, minHeight: 1080 });
    expect(results).toHaveLength(1);
    expect(results[0].accepted).toBe(true);
  });

  it("rejects images below minimum resolution", () => {
    const photos = [makePhoto({ id: 1, width: 640, height: 480 })];
    const results = reviewCandidates(photos, { minWidth: 1920, minHeight: 1080 });
    expect(results).toHaveLength(1);
    expect(results[0].accepted).toBe(false);
    expect(results[0].reasons.some((r) => r.toLowerCase().includes("resolution"))).toBe(true);
  });

  it("evaluates color palette for light/dark suitability", () => {
    const darkPhoto = makePhoto({ id: 1, avg_color: "#1A1A2E" });
    const lightPhoto = makePhoto({ id: 2, avg_color: "#F0E6D3" });

    const results = reviewCandidates([darkPhoto, lightPhoto], {
      minWidth: 100,
      minHeight: 100,
    });

    const darkResult = results.find((r) => r.photo.id === 1);
    const lightResult = results.find((r) => r.photo.id === 2);

    expect(darkResult?.themeVariant).toBe("dark");
    expect(lightResult?.themeVariant).toBe("light");
  });

  it("produces structured review report", () => {
    const photos = [
      makePhoto({ id: 1, width: 4000, height: 2667 }),
      makePhoto({ id: 2, width: 320, height: 240 }),
    ];

    const results = reviewCandidates(photos, { minWidth: 1920, minHeight: 1080 });

    expect(results).toHaveLength(2);
    for (const result of results) {
      expect(result).toHaveProperty("photo");
      expect(result).toHaveProperty("accepted");
      expect(result).toHaveProperty("themeVariant");
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("reasons");
      expect(Array.isArray(result.reasons)).toBe(true);
    }
  });
});
