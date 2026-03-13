import { describe, it, expect, vi } from "vitest";
import { searchPexels } from "../pexels-search.js";
import type { PexelsSearchResponse, PexelsPhoto } from "../lib/types.js";

function makePhoto(overrides: Partial<PexelsPhoto> = {}): PexelsPhoto {
  return {
    id: 1,
    width: 4000,
    height: 2667,
    url: "https://www.pexels.com/photo/1/",
    photographer: "Test",
    photographer_url: "https://www.pexels.com/@test",
    photographer_id: 1,
    avg_color: "#000000",
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

describe("searchPexels", () => {
  it("returns structured results from mock API response", async () => {
    const photos = [makePhoto({ id: 1 }), makePhoto({ id: 2 })];
    const mockResponse: PexelsSearchResponse = {
      total_results: 2,
      page: 1,
      per_page: 5,
      photos,
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "100" }),
      json: () => Promise.resolve(mockResponse),
    });

    const result = await searchPexels(
      { query: "test" },
      "test-key",
      mockFetch,
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[1].id).toBe(2);
  });

  it("filters by orientation", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "100" }),
      json: () =>
        Promise.resolve({
          total_results: 0,
          page: 1,
          per_page: 5,
          photos: [],
        }),
    });

    await searchPexels(
      { query: "test", orientation: "landscape" },
      "test-key",
      mockFetch,
    );

    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.searchParams.get("orientation")).toBe("landscape");
  });

  it("filters by minimum resolution", async () => {
    const photos = [
      makePhoto({ id: 1, width: 800, height: 600 }),
      makePhoto({ id: 2, width: 4000, height: 3000 }),
      makePhoto({ id: 3, width: 2000, height: 1500 }),
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "100" }),
      json: () =>
        Promise.resolve({
          total_results: 3,
          page: 1,
          per_page: 5,
          photos,
        }),
    });

    const result = await searchPexels(
      { query: "test", minWidth: 1920, minHeight: 1080 },
      "test-key",
      mockFetch,
    );

    expect(result).toHaveLength(2);
    expect(result.every((p) => p.width >= 1920 && p.height >= 1080)).toBe(
      true,
    );
  });

  it("returns empty array for no results (not error)", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "100" }),
      json: () =>
        Promise.resolve({
          total_results: 0,
          page: 1,
          per_page: 5,
          photos: [],
        }),
    });

    const result = await searchPexels({ query: "xyzzy" }, "test-key", mockFetch);
    expect(result).toEqual([]);
  });
});
