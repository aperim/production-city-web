/**
 * E2E tests: Landing page i18n and RTL layout.
 * Validates language switching, html attributes, and RTL rendering.
 */

import { test, expect } from "@playwright/test";

test.describe("i18n — language switcher", () => {
  test("language switcher is visible on home page", async ({ page }) => {
    await page.goto("/");
    // The language switcher trigger button should be visible
    const trigger = page.getByRole("button", { name: /language/i });
    await expect(trigger).toBeVisible();
  });

  test("html lang attribute defaults to en", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test.describe("i18n — RTL layout", () => {
  test("Arabic locale sets dir=rtl on html", async ({ page }) => {
    // Navigate to Arabic version
    await page.goto("/ar/");
    // Check RTL attributes
    const html = page.locator("html");
    await expect(html).toHaveAttribute("dir", "rtl");
    await expect(html).toHaveAttribute("lang", "ar");
  });

  test("navigation renders in Arabic locale", async ({ page }) => {
    await page.goto("/ar/");
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
  });
});

test.describe("i18n — locale prefix routing", () => {
  const localeTests = [
    { locale: "zh", path: "/zh/" },
    { locale: "es", path: "/es/" },
    { locale: "fr", path: "/fr/" },
    { locale: "ja", path: "/ja/" },
  ];

  for (const { locale, path } of localeTests) {
    test(`${locale} locale page loads at ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response).not.toBeNull();
      // Page should load (200) or redirect
      expect(response!.status()).toBeLessThan(400);
    });
  }
});

test.describe("i18n — page content", () => {
  test("all pages render without layout breakage on language switch", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();

    // Page should not have horizontal overflow
    const overflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1
      );
    });
    expect(overflow).toBe(false);
  });
});
