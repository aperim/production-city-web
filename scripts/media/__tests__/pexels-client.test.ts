import { describe, it, expect, vi, beforeEach } from "vitest";
import { PexelsClient } from "../lib/pexels-client.js";
import type { PexelsSearchResponse, PexelsVideoSearchResponse } from "../lib/types.js";

const MOCK_PHOTO_RESPONSE: PexelsSearchResponse = {
  total_results: 100,
  page: 1,
  per_page: 5,
  photos: [
    {
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
    },
  ],
};

const MOCK_VIDEO_RESPONSE: PexelsVideoSearchResponse = {
  total_results: 50,
  page: 1,
  per_page: 5,
  videos: [
    {
      id: 99999,
      width: 1920,
      height: 1080,
      url: "https://www.pexels.com/video/test-99999/",
      image: "https://images.pexels.com/videos/99999/thumb.jpeg",
      duration: 30,
      user: {
        id: 11111,
        name: "John Smith",
        url: "https://www.pexels.com/@johnsmith",
      },
      video_files: [
        {
          id: 1,
          quality: "hd",
          file_type: "video/mp4",
          width: 1920,
          height: 1080,
          fps: 30,
          link: "https://videos.pexels.com/99999/hd.mp4",
        },
      ],
    },
  ],
};

describe("PexelsClient", () => {
  let client: PexelsClient;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    client = new PexelsClient("test-api-key", mockFetch);
  });

  it("correctly constructs search URL with query params", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "100" }),
      json: () => Promise.resolve(MOCK_PHOTO_RESPONSE),
    });

    await client.searchPhotos({ query: "film studio", perPage: 5, page: 1 });

    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe(
      "https://api.pexels.com/v1/search",
    );
    expect(url.searchParams.get("query")).toBe("film studio");
    expect(url.searchParams.get("per_page")).toBe("5");
    expect(url.searchParams.get("page")).toBe("1");
  });

  it("sends Authorization header with API key", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "100" }),
      json: () => Promise.resolve(MOCK_PHOTO_RESPONSE),
    });

    await client.searchPhotos({ query: "test" });

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("test-api-key");
  });

  it("parses photo response into typed objects", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "100" }),
      json: () => Promise.resolve(MOCK_PHOTO_RESPONSE),
    });

    const result = await client.searchPhotos({ query: "test" });

    expect(result.photos).toHaveLength(1);
    expect(result.photos[0].id).toBe(12345);
    expect(result.photos[0].photographer).toBe("Jane Doe");
    expect(result.photos[0].src.original).toContain("original.jpeg");
    expect(result.total_results).toBe(100);
  });

  it("parses video response into typed objects", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "100" }),
      json: () => Promise.resolve(MOCK_VIDEO_RESPONSE),
    });

    const result = await client.searchVideos({ query: "test" });

    expect(result.videos).toHaveLength(1);
    expect(result.videos[0].id).toBe(99999);
    expect(result.videos[0].user.name).toBe("John Smith");
    expect(result.videos[0].video_files[0].quality).toBe("hd");
  });

  it("handles pagination params", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "100" }),
      json: () => Promise.resolve(MOCK_PHOTO_RESPONSE),
    });

    await client.searchPhotos({ query: "test", page: 3, perPage: 10 });

    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.searchParams.get("page")).toBe("3");
    expect(url.searchParams.get("per_page")).toBe("10");
  });

  it("handles orientation filter", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "x-ratelimit-remaining": "100" }),
      json: () => Promise.resolve(MOCK_PHOTO_RESPONSE),
    });

    await client.searchPhotos({ query: "test", orientation: "landscape" });

    const url = new URL(mockFetch.mock.calls[0][0]);
    expect(url.searchParams.get("orientation")).toBe("landscape");
  });

  it("throws on 401 unauthorized", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      headers: new Headers(),
    });

    await expect(client.searchPhotos({ query: "test" })).rejects.toThrow(
      /401.*Unauthorized/i,
    );
  });

  it("throws on 429 rate limit with meaningful message", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      headers: new Headers(),
    });

    await expect(client.searchPhotos({ query: "test" })).rejects.toThrow(
      /rate limit/i,
    );
  });

  it("throws on 500 server error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      headers: new Headers(),
    });

    await expect(client.searchPhotos({ query: "test" })).rejects.toThrow(
      /500/,
    );
  });

  it("warns when rate limit remaining is low", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({
        "x-ratelimit-remaining": "5",
        "x-ratelimit-limit": "200",
      }),
      json: () => Promise.resolve(MOCK_PHOTO_RESPONSE),
    });

    await client.searchPhotos({ query: "test" });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("rate limit"),
    );
    warnSpy.mockRestore();
  });
});
