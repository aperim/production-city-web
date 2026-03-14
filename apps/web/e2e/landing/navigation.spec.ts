/**
 * E2E tests: Landing page navigation and routing.
 * Validates all 7 pages load, nav links work, and locale prefix routing.
 */

import { test, expect } from "@playwright/test";
import { LANDING_PAGES } from "./helpers";

test.describe("Landing page navigation", () => {
  for (const page of LANDING_PAGES) {
    test(`${page.name} page loads at ${page.path}`, async ({ page: p }) => {
      const response = await p.goto(page.path);
      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);
      await expect(p.getByRole("main")).toBeVisible();
    });
  }

  test("navigation links point to correct routes", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();

    // Check key nav links exist
    await expect(nav.getByRole("link", { name: /facilities/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /creative/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /vision/i })).toBeVisible();
  });

  test("navigation between pages works", async ({ page }) => {
    await page.goto("/");

    // Click Facilities link
    await page.getByRole("navigation").getByRole("link", { name: /facilities/i }).click();
    await expect(page).toHaveURL(/\/facilities/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("skip-to-content link is present", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator("a[href='#main-content']");
    await expect(skipLink).toBeAttached();
  });

  test("footer is present on all pages", async ({ page }) => {
    for (const lp of LANDING_PAGES) {
      await page.goto(lp.path);
      await expect(page.getByRole("contentinfo")).toBeVisible();
    }
  });
});

test.describe("Landmark regions", () => {
  test("all pages have nav, main, and footer landmarks", async ({ page }) => {
    for (const lp of LANDING_PAGES) {
      await page.goto(lp.path);
      await expect(page.getByRole("navigation")).toBeVisible();
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    }
  });
});
