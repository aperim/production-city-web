/**
 * Tests for LocaleHead component — hreflang, canonical, og:locale, SEO meta.
 * @see Issue #278
 */

import { describe, it, expect } from "vitest";
import {
  buildHreflangLinks,
  buildCanonicalUrl,
  validatePath,
  stripTrackingParams,
  getOgLocaleAlternates,
} from "../LocaleHead.js";
const CANONICAL_HOST = "https://production.city";

describe("LocaleHead (Issue #278)", () => {
  describe("buildHreflangLinks()", () => {
    it("renders 10 locale links + 1 x-default = 11 total", () => {
      const links = buildHreflangLinks("/facilities", CANONICAL_HOST);
      expect(links).toHaveLength(11);
    });

    it("x-default points to English URL (no prefix)", () => {
      const links = buildHreflangLinks("/facilities", CANONICAL_HOST);
      const xDefault = links.find((l) => l.hreflang === "x-default");
      expect(xDefault).toBeDefined();
      expect(xDefault!.href).toBe("https://production.city/facilities");
    });

    it("English has no locale prefix", () => {
      const links = buildHreflangLinks("/facilities", CANONICAL_HOST);
      const en = links.find((l) => l.hreflang === "en");
      expect(en!.href).toBe("https://production.city/facilities");
    });

    it("non-English locales have /{locale}/ prefix", () => {
      const links = buildHreflangLinks("/facilities", CANONICAL_HOST);
      const zh = links.find((l) => l.hreflang === "zh");
      expect(zh!.href).toBe("https://production.city/zh/facilities");

      const ar = links.find((l) => l.hreflang === "ar");
      expect(ar!.href).toBe("https://production.city/ar/facilities");
    });

    it("handles root path correctly", () => {
      const links = buildHreflangLinks("/", CANONICAL_HOST);
      const en = links.find((l) => l.hreflang === "en");
      expect(en!.href).toBe("https://production.city/");

      const zh = links.find((l) => l.hreflang === "zh");
      expect(zh!.href).toBe("https://production.city/zh/");
    });

    it("all hreflang values are valid BCP 47 tags", () => {
      const links = buildHreflangLinks("/", CANONICAL_HOST);
      for (const link of links) {
        expect(link.hreflang).toMatch(/^(x-default|[a-z]{2})$/);
      }
    });
  });

  describe("buildCanonicalUrl()", () => {
    it("builds canonical for English (no prefix)", () => {
      const url = buildCanonicalUrl("/facilities", "en", CANONICAL_HOST);
      expect(url).toBe("https://production.city/facilities");
    });

    it("builds canonical for non-English locale", () => {
      const url = buildCanonicalUrl("/facilities", "zh", CANONICAL_HOST);
      expect(url).toBe("https://production.city/zh/facilities");
    });

    it("builds canonical for root path", () => {
      expect(buildCanonicalUrl("/", "en", CANONICAL_HOST)).toBe(
        "https://production.city/",
      );
      expect(buildCanonicalUrl("/", "zh", CANONICAL_HOST)).toBe(
        "https://production.city/zh/",
      );
    });
  });

  describe("stripTrackingParams()", () => {
    it("strips utm_* params", () => {
      const result = stripTrackingParams("?utm_source=google&utm_medium=cpc&page=1");
      expect(result).toBe("?page=1");
    });

    it("strips fbclid", () => {
      const result = stripTrackingParams("?fbclid=abc123&page=1");
      expect(result).toBe("?page=1");
    });

    it("strips gclid", () => {
      const result = stripTrackingParams("?gclid=abc123");
      expect(result).toBe("");
    });

    it("preserves non-tracking params", () => {
      const result = stripTrackingParams("?page=1&sort=name");
      expect(result).toBe("?page=1&sort=name");
    });

    it("returns empty string when all params are tracking", () => {
      const result = stripTrackingParams("?utm_source=google&fbclid=abc");
      expect(result).toBe("");
    });
  });

  describe("validatePath()", () => {
    it("accepts valid paths", () => {
      expect(validatePath("/facilities")).toBe(true);
      expect(validatePath("/")).toBe(true);
      expect(validatePath("/contact")).toBe(true);
    });

    it("rejects encoded slashes", () => {
      expect(validatePath("/%2F%2Fevil.com")).toBe(false);
    });

    it("rejects dot segments", () => {
      expect(validatePath("/../secret")).toBe(false);
      expect(validatePath("/..%2Fsecret")).toBe(false);
    });

    it("rejects authority components", () => {
      expect(validatePath("//evil.com")).toBe(false);
    });

    it("rejects paths with @", () => {
      expect(validatePath("/user@evil.com")).toBe(false);
    });
  });

  describe("getOgLocaleAlternates()", () => {
    it("returns all locales except current as alternates", () => {
      const alts = getOgLocaleAlternates("en");
      expect(alts).toHaveLength(9);
      expect(alts).not.toContain("en_US");
    });

    it("returns correct og:locale values", () => {
      const alts = getOgLocaleAlternates("zh");
      expect(alts).toContain("en_US");
      expect(alts).not.toContain("zh_CN");
    });
  });
});
