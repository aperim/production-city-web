import { describe, it, expect } from "vitest";
import { selectPairs } from "../pexels-pair.js";
import type { ReviewResult, PexelsPhoto } from "../lib/types.js";

function makePhoto(overrides: Partial<PexelsPhoto> = {}): PexelsPhoto {
  return {
    id: 1,
    width: 4000,
    height: 2667,
    url: "https://www.pexels.com/photo/1/",
    photographer: "Test",
    photographer_url: "https://www.pexels.com/@test",
    photographer_id: 1,
    avg_color: "#808080",
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
    alt: "Test photo",
    ...overrides,
  };
}

function makeReview(
  overrides: Partial<ReviewResult> & { photo?: Partial<PexelsPhoto> } = {},
): ReviewResult {
  const { photo: photoOverrides, ...rest } = overrides;
  return {
    photo: makePhoto(photoOverrides),
    accepted: true,
    themeVariant: "universal",
    score: 80,
    reasons: ["Good quality"],
    ...rest,
  };
}

describe("selectPairs", () => {
  it("selects light/dark pair from candidates", () => {
    const candidates: ReviewResult[] = [
      makeReview({
        photo: { id: 1, avg_color: "#F0E6D3" },
        themeVariant: "light",
        score: 90,
      }),
      makeReview({
        photo: { id: 2, avg_color: "#1A1A2E" },
        themeVariant: "dark",
        score: 85,
      }),
      makeReview({
        photo: { id: 3, avg_color: "#F5F5F5" },
        themeVariant: "light",
        score: 70,
      }),
    ];

    const result = selectPairs(candidates, "hero-home");

    expect(result.contentContext).toBe("hero-home");
    expect(result.light).not.toBeNull();
    expect(result.dark).not.toBeNull();
    expect(result.light?.id).toBe(1); // highest scoring light
    expect(result.dark?.id).toBe(2);
  });

  it("falls back to single image for both modes if no pair available", () => {
    const candidates: ReviewResult[] = [
      makeReview({
        photo: { id: 1 },
        themeVariant: "universal",
        score: 90,
      }),
    ];

    const result = selectPairs(candidates, "hero-home");

    expect(result.light).toBeNull();
    expect(result.dark).toBeNull();
    expect(result.fallback).not.toBeNull();
    expect(result.fallback?.id).toBe(1);
  });

  it("rejects pairs with insufficient contrast difference", () => {
    const candidates: ReviewResult[] = [
      makeReview({
        photo: { id: 1, avg_color: "#808080" },
        themeVariant: "light",
        score: 90,
      }),
      makeReview({
        photo: { id: 2, avg_color: "#7A7A7A" },
        themeVariant: "dark",
        score: 85,
      }),
    ];

    const result = selectPairs(candidates, "hero-home");

    // Similar colors should fall back to best universal
    expect(result.light).toBeNull();
    expect(result.dark).toBeNull();
    expect(result.fallback).not.toBeNull();
  });

  it("handles empty candidates", () => {
    const result = selectPairs([], "hero-home");
    expect(result.light).toBeNull();
    expect(result.dark).toBeNull();
    expect(result.fallback).toBeNull();
  });
});
