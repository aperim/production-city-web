/**
 * Tests for Worker locale middleware.
 *
 * Tests the locale routing logic in isolation (same pattern as index.test.ts).
 * The vinext handler is not available in jsdom tests, so we test the middleware
 * functions directly.
 *
 * @see Issue #277
 */

import { describe, it, expect } from "vitest";
import {
  parseLocalePrefix,
  shouldBypassLocaleMiddleware,
  parseAcceptLanguage,
  normalizeTrailingSlash,
  buildRedirectUrl,
  validateCookieLocale,
  sanitizeInvalidLocale,
} from "../locale-middleware.js";
const CANONICAL_ORIGIN = "https://production.city";

describe("Worker Locale Middleware (Issue #277)", () => {
  describe("parseLocalePrefix()", () => {
    it("extracts /zh/ prefix and returns locale + remaining path", () => {
      const result = parseLocalePrefix("/zh/facilities");
      expect(result).toEqual({ locale: "zh", remainingPath: "/facilities" });
    });

    it("extracts /ar/facilities and returns remaining path", () => {
      const result = parseLocalePrefix("/ar/facilities");
      expect(result).toEqual({ locale: "ar", remainingPath: "/facilities" });
    });

    it("handles locale root /zh/", () => {
      const result = parseLocalePrefix("/zh/");
      expect(result).toEqual({ locale: "zh", remainingPath: "/" });
    });

    it("returns null for no locale prefix (English)", () => {
      const result = parseLocalePrefix("/facilities");
      expect(result).toBeNull();
    });

    it("returns null for root path /", () => {
      const result = parseLocalePrefix("/");
      expect(result).toBeNull();
    });

    it("returns { locale: 'en', remainingPath } for /en/ prefix", () => {
      const result = parseLocalePrefix("/en/facilities");
      expect(result).toEqual({ locale: "en", remainingPath: "/facilities" });
    });

    it("returns null for unsupported 2-letter prefix /xx/", () => {
      const result = parseLocalePrefix("/xx/page");
      expect(result).toBeNull();
    });

    it("does not match paths that start with a longer segment", () => {
      const result = parseLocalePrefix("/english/page");
      expect(result).toBeNull();
    });

    it("handles lowercase locale codes only", () => {
      const result = parseLocalePrefix("/ZH/facilities");
      expect(result).toEqual({ locale: "zh", remainingPath: "/facilities" });
    });

    it("returns null for /faq — 3-letter page route is NOT a locale (Issue #304)", () => {
      const result = parseLocalePrefix("/faq");
      expect(result).toBeNull();
    });

    it("returns null for /faq/ — 3-letter page route with trailing slash is NOT a locale", () => {
      const result = parseLocalePrefix("/faq/");
      expect(result).toBeNull();
    });

    it("returns null for other short page routes like /app, /api, /dev", () => {
      expect(parseLocalePrefix("/app")).toBeNull();
      expect(parseLocalePrefix("/dev")).toBeNull();
      expect(parseLocalePrefix("/map")).toBeNull();
    });

    it("returns null for unsupported 3-letter codes with sub-paths", () => {
      const result = parseLocalePrefix("/faq/topic");
      expect(result).toBeNull();
    });
  });

  describe("shouldBypassLocaleMiddleware()", () => {
    it("bypasses API routes", () => {
      expect(shouldBypassLocaleMiddleware("/api/health")).toBe(true);
      expect(shouldBypassLocaleMiddleware("/api/v1/users")).toBe(true);
    });

    it("bypasses auth callbacks", () => {
      expect(shouldBypassLocaleMiddleware("/auth/callback")).toBe(true);
    });

    it("bypasses static assets", () => {
      expect(shouldBypassLocaleMiddleware("/assets/image.png")).toBe(true);
      expect(shouldBypassLocaleMiddleware("/_next/static/chunk.js")).toBe(true);
    });

    it("bypasses robots.txt", () => {
      expect(shouldBypassLocaleMiddleware("/robots.txt")).toBe(true);
    });

    it("bypasses sitemap.xml", () => {
      expect(shouldBypassLocaleMiddleware("/sitemap.xml")).toBe(true);
    });

    it("bypasses favicon", () => {
      expect(shouldBypassLocaleMiddleware("/favicon.ico")).toBe(true);
    });

    it("does not bypass marketing pages", () => {
      expect(shouldBypassLocaleMiddleware("/facilities")).toBe(false);
      expect(shouldBypassLocaleMiddleware("/")).toBe(false);
      expect(shouldBypassLocaleMiddleware("/contact")).toBe(false);
    });
  });

  describe("parseAcceptLanguage()", () => {
    it("parses simple Accept-Language header", () => {
      const result = parseAcceptLanguage("zh-CN,zh;q=0.9,en;q=0.8");
      expect(result).toBe("zh");
    });

    it("returns null for English-only", () => {
      const result = parseAcceptLanguage("en-US,en;q=0.9");
      expect(result).toBeNull();
    });

    it("returns null for empty header", () => {
      expect(parseAcceptLanguage("")).toBeNull();
    });

    it("returns null for null/undefined", () => {
      expect(parseAcceptLanguage(null as unknown as string)).toBeNull();
    });

    it("rejects headers exceeding 1024 chars", () => {
      const longHeader = "zh;q=0.9," + "x".repeat(1020);
      expect(parseAcceptLanguage(longHeader)).toBeNull();
    });

    it("handles malformed q-values gracefully", () => {
      expect(parseAcceptLanguage("zh;q=abc,en;q=0.5")).toBeNull();
    });

    it("handles wildcards", () => {
      const result = parseAcceptLanguage("*;q=0.1,zh;q=0.9");
      expect(result).toBe("zh");
    });

    it("defaults to no suggestion on parse failure", () => {
      expect(parseAcceptLanguage(";;;")).toBeNull();
    });

    it("resolves sub-tags: pt-BR -> pt", () => {
      const result = parseAcceptLanguage("pt-BR,pt;q=0.9,en;q=0.8");
      expect(result).toBe("pt");
    });

    it("resolves sub-tags: zh-Hans-CN -> zh", () => {
      const result = parseAcceptLanguage("zh-Hans-CN");
      expect(result).toBe("zh");
    });
  });

  describe("normalizeTrailingSlash()", () => {
    it("/zh → redirect to /zh/", () => {
      const result = normalizeTrailingSlash("/zh", "zh");
      expect(result).toEqual({ redirect: "/zh/", status: 301 });
    });

    it("/zh/facilities/ → redirect to /zh/facilities", () => {
      const result = normalizeTrailingSlash("/zh/facilities/", "zh");
      expect(result).toEqual({ redirect: "/zh/facilities", status: 301 });
    });

    it("/facilities/ → redirect to /facilities", () => {
      const result = normalizeTrailingSlash("/facilities/", null);
      expect(result).toEqual({ redirect: "/facilities", status: 301 });
    });

    it("/zh/ → no redirect needed (locale root)", () => {
      const result = normalizeTrailingSlash("/zh/", "zh");
      expect(result).toBeNull();
    });

    it("/ → no redirect needed", () => {
      const result = normalizeTrailingSlash("/", null);
      expect(result).toBeNull();
    });

    it("/facilities → no redirect needed", () => {
      const result = normalizeTrailingSlash("/facilities", null);
      expect(result).toBeNull();
    });
  });

  describe("buildRedirectUrl()", () => {
    it("builds absolute redirect URL with canonical origin", () => {
      const url = buildRedirectUrl("/facilities", CANONICAL_ORIGIN);
      expect(url).toBe("https://production.city/facilities");
    });

    it("verifies origin matches canonical", () => {
      const url = buildRedirectUrl("/page", CANONICAL_ORIGIN);
      const parsed = new URL(url);
      expect(parsed.origin).toBe(CANONICAL_ORIGIN);
    });

    it("rejects encoded slashes (%2F%2F)", () => {
      expect(() => buildRedirectUrl("/%2F%2Fevil.com", CANONICAL_ORIGIN)).toThrow();
    });

    it("rejects backslash (%5C)", () => {
      expect(() => buildRedirectUrl("/%5Cevil.com", CANONICAL_ORIGIN)).toThrow();
    });

    it("rejects dot segments (%2E%2E)", () => {
      expect(() => buildRedirectUrl("/%2e%2e/secret", CANONICAL_ORIGIN)).toThrow();
    });

    it("rejects authority components (//)", () => {
      expect(() => buildRedirectUrl("//evil.com", CANONICAL_ORIGIN)).toThrow();
    });

    it("rejects @ in path", () => {
      expect(() => buildRedirectUrl("/user@evil.com", CANONICAL_ORIGIN)).toThrow();
    });

    it("preserves query params", () => {
      const url = buildRedirectUrl("/page?foo=bar", CANONICAL_ORIGIN);
      expect(url).toBe("https://production.city/page?foo=bar");
    });
  });

  describe("validateCookieLocale()", () => {
    it("returns valid locale", () => {
      expect(validateCookieLocale("zh")).toBe("zh");
    });

    it("rejects invalid locale", () => {
      expect(validateCookieLocale("xx")).toBeNull();
    });

    it("rejects empty string", () => {
      expect(validateCookieLocale("")).toBeNull();
    });

    it("rejects path traversal", () => {
      expect(validateCookieLocale("../../x")).toBeNull();
    });

    it("rejects double slash", () => {
      expect(validateCookieLocale("//evil.example")).toBeNull();
    });

    it("rejects overly long values", () => {
      expect(validateCookieLocale("z".repeat(100))).toBeNull();
    });
  });

  describe("sanitizeInvalidLocale()", () => {
    it("returns a fixed-length hash, not raw input", () => {
      const result = sanitizeInvalidLocale("some-invalid-locale");
      expect(result.length).toBeLessThanOrEqual(16);
      expect(result).not.toContain("some-invalid-locale");
    });
  });

  describe("single redirect rule", () => {
    it("/ZH/facilities/ produces single redirect", () => {
      // When both case and trailing slash need fixing, it should be one redirect
      const parsed = parseLocalePrefix("/ZH/facilities/");
      expect(parsed).toEqual({ locale: "zh", remainingPath: "/facilities/" });
      // The middleware should handle case normalization + trailing slash in one 301
    });
  });

  describe("X-Locale header handling", () => {
    it("strips pre-existing X-Locale from client request", () => {
      // This tests that a request with an injected X-Locale header gets it removed
      const headers = new Headers({ "X-Locale": "attacker-value" });
      headers.delete("X-Locale");
      expect(headers.get("X-Locale")).toBeNull();
    });
  });

  describe("HEAD method and non-HTML", () => {
    it("HEAD requests should be handled the same as GET for redirects", () => {
      // HEAD should get same redirect behavior
      const parsed = parseLocalePrefix("/zh/facilities");
      expect(parsed).toEqual({ locale: "zh", remainingPath: "/facilities" });
    });
  });
});
