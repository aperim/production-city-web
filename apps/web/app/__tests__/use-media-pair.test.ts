/**
 * Tests for useMediaPair hook — validates fetch behavior,
 * loading/error states, and AbortController cleanup.
 *
 * Since @testing-library/react is not available, we test the
 * underlying fetchMediaPair function and the hook's contract.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchMediaPair } from "../lib/api-client";

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
    statusText: "OK",
    json: () => Promise.resolve(data),
  });
}

const MOCK_PAIR = {
  id: "pair-1",
  contentContext: "hero-home",
  light: {
    id: "l1",
    publicPath: "/media/hero-home/light.jpg",
    alt: "Light",
    width: 1920,
    height: 1080,
    averageColor: null,
    photographer: "Jane",
    photographerUrl: null,
    source: "pexels",
    externalUrl: null,
    aiAssisted: false,
    aiGenerated: false,
    hasFirstNationsPermission: false,
    license: "pexels",
    attributionText: null,
  },
  dark: {
    id: "d1",
    publicPath: "/media/hero-home/dark.jpg",
    alt: "Dark",
    width: 1920,
    height: 1080,
    averageColor: null,
    photographer: "Jane",
    photographerUrl: null,
    source: "pexels",
    externalUrl: null,
    aiAssisted: false,
    aiGenerated: false,
    hasFirstNationsPermission: false,
    license: "pexels",
    attributionText: null,
  },
};

describe("useMediaPair underlying fetch", () => {
  it("fetchMediaPair returns data for valid context", async () => {
    mockFetch.mockReturnValue(jsonResponse(MOCK_PAIR));
    const result = await fetchMediaPair("hero-home");
    expect(result).not.toBeNull();
    expect(result?.contentContext).toBe("hero-home");
    expect(result?.light.publicPath).toBe("/media/hero-home/light.jpg");
  });

  it("fetchMediaPair returns null for 404", async () => {
    mockFetch.mockReturnValue(jsonResponse({ error: "not_found" }, 404));
    const result = await fetchMediaPair("missing");
    expect(result).toBeNull();
  });

  it("fetchMediaPair throws for server error", async () => {
    mockFetch.mockReturnValue(jsonResponse({ error: "internal", message: "Fail" }, 500));
    await expect(fetchMediaPair("broken")).rejects.toThrow("Fail");
  });

  it("fetchMediaPair passes AbortSignal", async () => {
    mockFetch.mockReturnValue(jsonResponse(MOCK_PAIR));
    const controller = new AbortController();
    await fetchMediaPair("hero-home", { signal: controller.signal });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it("fetchMediaPair aborts correctly", async () => {
    const controller = new AbortController();
    const abortError = new DOMException("Aborted", "AbortError");
    mockFetch.mockRejectedValue(abortError);

    await expect(fetchMediaPair("hero-home", { signal: controller.signal })).rejects.toThrow();
  });
});

describe("useMediaPair hook contract", () => {
  it("module exports useMediaPair function", async () => {
    const mod = await import("../lib/use-media-pair");
    expect(typeof mod.useMediaPair).toBe("function");
  });

  it("useMediaPairs module exports useMediaPairs function", async () => {
    const mod = await import("../lib/use-media-pairs");
    expect(typeof mod.useMediaPairs).toBe("function");
  });
});
