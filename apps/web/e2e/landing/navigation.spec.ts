/**
 * E2E tests: Landing page navigation and routing.
 * Validates all 17 pages load, nav links work, active-page indicators,
 * and basic 404 behaviour for unknown routes.
 *
 * @see PRO-190
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

    // Open mobile menu if nav links are hidden (hamburger layout)
    // Retry click until hydration completes and menu opens
    const menuBtn = nav.getByRole("button", { name: /navigation menu/i });
    if (await menuBtn.isVisible()) {
      await expect(async () => {
        await menuBtn.click();
        await expect(nav.getByRole("link", { name: /facilities/i })).toBeVisible({ timeout: 1_000 });
      }).toPass({ timeout: 15_000 });
    }

    // Check key nav links exist
    await expect(nav.getByRole("link", { name: /facilities/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /creative/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /vision/i })).toBeVisible();
  });

  test("navigation between pages works", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");

    // Open mobile menu if nav links are hidden (hamburger layout)
    // Retry click until hydration completes and menu opens
    const menuBtn = nav.getByRole("button", { name: /navigation menu/i });
    if (await menuBtn.isVisible()) {
      await expect(async () => {
        await menuBtn.click();
        await expect(nav.getByRole("link", { name: /facilities/i })).toBeVisible({ timeout: 1_000 });
      }).toPass({ timeout: 15_000 });
    }

    // Click Facilities link
    await nav.getByRole("link", { name: /facilities/i }).click();
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

// ─── Active page indicator ───────────────────────────────────────────────────

test.describe("Active page indicator", () => {
  test("home page nav link has aria-current=page on /", async ({ page }) => {
    await page.goto("/");
    // The home/logo link should be marked current on the root path.
    // Any nav link pointing to the current page must carry aria-current="page".
    const currentLinks = page
      .getByRole("navigation")
      .locator('[aria-current="page"]');
    await expect(currentLinks.first()).toBeVisible();
  });

  test("facilities nav link has aria-current=page on /facilities", async ({
    page,
  }) => {
    await page.goto("/facilities");
    const nav = page.getByRole("navigation");

    // Open hamburger if needed
    const menuBtn = nav.getByRole("button", { name: /navigation menu/i });
    if (await menuBtn.isVisible()) {
      await expect(async () => {
        await menuBtn.click();
        await expect(nav.locator('[aria-current="page"]')).toBeVisible({
          timeout: 1_000,
        });
      }).toPass({ timeout: 15_000 });
    }

    const currentLinks = nav.locator('[aria-current="page"]');
    await expect(currentLinks.first()).toBeVisible();
  });
});

// ─── Unknown routes (404) ────────────────────────────────────────────────────

test.describe("Unknown routes", () => {
  test("completely unknown path returns a non-200 status or 404 page", async ({
    page,
  }) => {
    const response = await page.goto("/this-path-does-not-exist-at-all");
    // The response should be 404 — not a soft redirect to / that hides the 404.
    expect(response?.status()).toBe(404);
  });

  test("deeply nested unknown path returns 404", async ({ page }) => {
    const response = await page.goto("/a/b/c/d/e/f/g");
    expect(response?.status()).toBe(404);
  });
});
