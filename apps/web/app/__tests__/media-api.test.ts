import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchMediaPair, fetchMediaPairs } from "../lib/api-client";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(data),
  });
}

const MOCK_PAIR = {
  id: "pair-1",
  contentContext: "hero-home",
  light: {
    id: "asset-light",
    publicPath: "/media/hero-home/light.jpg",
    alt: "Hero light",
    width: 1920,
    height: 1080,
    averageColor: "#2A3B4C",
    photographer: "Jane Doe",
    photographerUrl: "https://pexels.com/@jane",
    source: "pexels",
    externalUrl: null,
    aiAssisted: false,
    aiGenerated: false,
    hasFirstNationsPermission: false,
    license: "pexels",
    attributionText: "Photo by Jane Doe on Pexels",
  },
  dark: {
    id: "asset-dark",
    publicPath: "/media/hero-home/dark.jpg",
    alt: "Hero dark",
    width: 1920,
    height: 1080,
    averageColor: "#1A1B1C",
    photographer: "Jane Doe",
    photographerUrl: "https://pexels.com/@jane",
    source: "pexels",
    externalUrl: null,
    aiAssisted: false,
    aiGenerated: false,
    hasFirstNationsPermission: false,
    license: "pexels",
    attributionText: "Photo by Jane Doe on Pexels",
  },
};

describe("fetchMediaPair", () => {
  it("returns parsed JSON for valid context", async () => {
    mockFetch.mockReturnValue(jsonResponse(MOCK_PAIR));

    const result = await fetchMediaPair("hero-home");
    expect(result).not.toBeNull();
    expect(result?.contentContext).toBe("hero-home");
    expect(result?.light.publicPath).toBe("/media/hero-home/light.jpg");
    expect(result?.dark.publicPath).toBe("/media/hero-home/dark.jpg");

    expect(mockFetch).toHaveBeenCalledWith(
      "/v1/media/pairs/hero-home",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("returns null for 404", async () => {
    mockFetch.mockReturnValue(jsonResponse({ error: "not_found", message: "Not found" }, 404));

    const result = await fetchMediaPair("nonexistent");
    expect(result).toBeNull();
  });

  it("throws for server errors", async () => {
    mockFetch.mockReturnValue(jsonResponse({ error: "internal", message: "Server error" }, 500));

    await expect(fetchMediaPair("broken")).rejects.toThrow("Server error");
  });

  it("properly encodes content context", async () => {
    mockFetch.mockReturnValue(jsonResponse(MOCK_PAIR));

    await fetchMediaPair("hero-home");
    expect(mockFetch).toHaveBeenCalledWith(
      "/v1/media/pairs/hero-home",
      expect.anything(),
    );
  });

  it("passes AbortSignal", async () => {
    mockFetch.mockReturnValue(jsonResponse(MOCK_PAIR));
    const controller = new AbortController();

    await fetchMediaPair("hero-home", { signal: controller.signal });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});

describe("fetchMediaPairs", () => {
  it("returns pairs for multiple contexts", async () => {
    mockFetch.mockReturnValue(jsonResponse({
      pairs: {
        "hero-home": MOCK_PAIR,
        "hero-facilities": { ...MOCK_PAIR, contentContext: "hero-facilities" },
      },
    }));

    const result = await fetchMediaPairs(["hero-home", "hero-facilities"]);
    expect(result).toHaveProperty("hero-home");
    expect(result).toHaveProperty("hero-facilities");
  });

  it("sends contexts as comma-separated query param", async () => {
    mockFetch.mockReturnValue(jsonResponse({ pairs: {} }));

    await fetchMediaPairs(["ctx-a", "ctx-b"]);
    expect(mockFetch).toHaveBeenCalledWith(
      "/v1/media/pairs?contexts=ctx-a%2Cctx-b",
      expect.anything(),
    );
  });
});
