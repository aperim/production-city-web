// @vitest-environment node
/**
 * Unit tests for XML sitemap generation.
 *
 * Verifies: all 7 pages x 10 locales (70 URL entries), hreflang alternates,
 * x-default pointing to English, absolute URLs with canonical origin.
 *
 * @see Issue #280
 */

import { describe, it, expect, beforeAll } from "vitest";
import { generateSitemap, PAGES, CANONICAL_ORIGIN } from "../generate-sitemap.js";

const SUPPORTED_LOCALES = [
  "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja",
] as const;

describe("generateSitemap", () => {
  let sitemap: string;

  // Generate once for all tests
  beforeAll(() => {
    sitemap = generateSitemap();
  });

  it("produces valid XML with correct declaration", () => {
    expect(sitemap).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  });

  it("includes XML namespace declarations for sitemap and xhtml", () => {
    expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(sitemap).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });

  it("includes all 7 pages x 10 locales = 70 URL entries", () => {
    const urlCount = (sitemap.match(/<url>/g) ?? []).length;
    expect(urlCount).toBe(PAGES.length * SUPPORTED_LOCALES.length);
  });

  it("uses canonical origin for all URLs", () => {
    const locElements = sitemap.match(/<loc>[^<]+<\/loc>/g) ?? [];
    for (const loc of locElements) {
      expect(loc).toContain(CANONICAL_ORIGIN);
    }
  });

  it("all URLs are absolute (start with https://)", () => {
    const hrefValues = sitemap.match(/href="([^"]+)"/g) ?? [];
    for (const href of hrefValues) {
      const url = href.replace(/^href="/, "").replace(/"$/, "");
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("each URL entry has hreflang alternates for all 10 locales", () => {
    // Extract all <url> blocks
    const urlBlocks = sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    expect(urlBlocks.length).toBeGreaterThan(0);

    for (const block of urlBlocks) {
      for (const locale of SUPPORTED_LOCALES) {
        expect(block).toContain(`hreflang="${locale}"`);
      }
    }
  });

  it("each URL entry has an x-default hreflang pointing to English URL", () => {
    const urlBlocks = sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    for (const block of urlBlocks) {
      expect(block).toContain('hreflang="x-default"');
      // x-default should point to English (no locale prefix)
      const xDefaultMatch = block.match(/hreflang="x-default"\s+href="([^"]+)"/);
      expect(xDefaultMatch).not.toBeNull();
      const xDefaultUrl = xDefaultMatch![1]!;
      // English URLs have no locale prefix — should not contain /en/
      expect(xDefaultUrl).not.toContain("/en/");
    }
  });

  it("English URLs have no locale prefix", () => {
    const urlBlocks = sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    // Find blocks where <loc> is an English URL
    for (const page of PAGES) {
      const englishUrl = page === "/"
        ? `${CANONICAL_ORIGIN}/`
        : `${CANONICAL_ORIGIN}${page}`;
      const hasEnglishLoc = urlBlocks.some((block) => block.includes(`<loc>${englishUrl}</loc>`));
      expect(hasEnglishLoc).toBe(true);
    }
  });

  it("non-English locale URLs use /{locale}/ prefix", () => {
    const nonEnLocales = SUPPORTED_LOCALES.filter((l) => l !== "en");
    for (const locale of nonEnLocales) {
      for (const page of PAGES) {
        const expectedUrl = page === "/"
          ? `${CANONICAL_ORIGIN}/${locale}/`
          : `${CANONICAL_ORIGIN}/${locale}${page}`;
        expect(sitemap).toContain(`<loc>${expectedUrl}</loc>`);
      }
    }
  });

  it("generates each page for all locales", () => {
    for (const page of PAGES) {
      for (const locale of SUPPORTED_LOCALES) {
        const expectedUrl = locale === "en"
          ? (page === "/" ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${page}`)
          : (page === "/" ? `${CANONICAL_ORIGIN}/${locale}/` : `${CANONICAL_ORIGIN}/${locale}${page}`);
        expect(sitemap).toContain(`<loc>${expectedUrl}</loc>`);
      }
    }
  });

  it("hreflang links use xhtml:link element with correct attributes", () => {
    expect(sitemap).toContain('<xhtml:link rel="alternate"');
  });
});
