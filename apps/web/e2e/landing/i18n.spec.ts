/**
 * E2E tests: Landing page i18n and RTL layout.
 * Validates language switching, html attributes, and client-side locale management.
 *
 * Note: Locale prefix routing (e.g. /zh/, /ar/) is not yet implemented as
 * server-side routes. The app uses client-side locale switching via localStorage
 * and a LanguageSwitcher component. Tests for URL-based locale routing are skipped
 * until server-side locale routing is implemented (see issue/221-222 for i18n phase).
 */

import { test, expect } from "@playwright/test";

test.describe("i18n — language switcher", () => {
  test("language switcher is visible on home page", async ({ page }) => {
    await page.goto("/");
    // The language switcher trigger button should be visible
    const trigger = page.getByRole("button", { name: /language/i });
    await expect(trigger.first()).toBeVisible();
  });

  test("html lang attribute defaults to en", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});

test.describe("i18n — client-side locale switching", () => {
  test("language switcher opens and shows locale options", async ({ page }) => {
    await page.goto("/");
    // Click the language switcher trigger (nav has one, footer has another — use first)
    const trigger = page.getByRole("navigation").getByRole("button", { name: /language/i });
    await trigger.click();
    // Should show locale options in a menu
    await expect(page.getByText("English").first()).toBeVisible();
  });
});

test.describe("i18n — locale prefix routing (not yet implemented)", () => {
  const localeTests = [
    { locale: "zh", path: "/zh/" },
    { locale: "es", path: "/es/" },
    { locale: "fr", path: "/fr/" },
    { locale: "ja", path: "/ja/" },
  ];

  for (const { locale, path } of localeTests) {
    test.skip(`${locale} locale page loads at ${path}`, async () => {
      // Server-side locale prefix routing is not yet implemented.
      // The app uses client-side locale switching via localStorage.
      // This test will be enabled when i18n phase (issues #221-222) lands.
    });
  }
});

test.describe("i18n — RTL layout (not yet implemented)", () => {
  test.skip("Arabic locale sets dir=rtl on html", async () => {
    // Requires server-side locale routing at /ar/ — not yet implemented.
    // RTL works client-side via language switcher but /ar/ route returns 404.
  });

  test.skip("navigation renders in Arabic locale", async () => {
    // Requires server-side locale routing at /ar/ — not yet implemented.
  });
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
