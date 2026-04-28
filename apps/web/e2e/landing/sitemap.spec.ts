/**
 * E2E tests: sitemap and robots.txt.
 *
 * Validates: sitemap accessibility, locale alternate links,
 * representative sample URL checks (Finding #25), robots.txt directive.
 *
 * @see Issue #280
 */

import { test, expect } from "@playwright/test";

const SUPPORTED_LOCALES = ["en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja"] as const;

test.describe("sitemap", () => {
  test("sitemap.xml is accessible at /sitemap.xml", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    const contentType = response?.headers()["content-type"] ?? "";
    expect(contentType).toMatch(/xml|text/);
  });

  test("sitemap contains hreflang alternate links for all locales", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    const body = await response?.text();
    expect(body).toBeDefined();

    for (const locale of SUPPORTED_LOCALES) {
      expect(body).toContain(`hreflang="${locale}"`);
    }
    expect(body).toContain('hreflang="x-default"');
  });

  test("sitemap contains entries for all public pages", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    const body = await response?.text();
    expect(body).toBeDefined();

    // Check that visible pages are present
    expect(body).toContain("/facilities");
    expect(body).toContain("/services");
    expect(body).toContain("/company");
    expect(body).toContain("/faq");
    expect(body).toContain("/contact");

    // Hidden pages must not appear in sitemap (PRO-486)
    expect(body).not.toContain("/creative");
    expect(body).not.toContain("/vision");
    expect(body).not.toContain("/network");
    expect(body).not.toContain("/community");
    expect(body).not.toContain("/company/approach");
    expect(body).not.toContain("/company/team");
  });

  test("representative sample: homepage URLs for all locales are present (Finding #25)", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    const body = await response?.text();
    expect(body).toBeDefined();

    // Verify homepage entries for all locales
    for (const locale of SUPPORTED_LOCALES) {
      if (locale === "en") {
        expect(body).toContain("https://production.city/</loc>");
      } else {
        expect(body).toContain(`https://production.city/${locale}/</loc>`);
      }
    }
  });

  test("representative sample: all public pages present for one non-English locale (Finding #25)", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    const body = await response?.text();
    expect(body).toBeDefined();

    const pages = ["/facilities", "/services", "/company", "/faq", "/contact"];
    for (const pagePath of pages) {
      expect(body).toContain(`https://production.city/zh${pagePath}</loc>`);
    }
  });
});

test.describe("robots.txt", () => {
  test("robots.txt is accessible", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    const contentType = response?.headers()["content-type"] ?? "";
    expect(contentType).toContain("text/plain");
  });

  test("robots.txt contains Sitemap directive", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    const body = await response?.text();
    expect(body).toContain("Sitemap: https://production.city/sitemap.xml");
  });

  test("robots.txt allows indexing", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    const body = await response?.text();
    expect(body).toContain("Allow: /");
  });
});
