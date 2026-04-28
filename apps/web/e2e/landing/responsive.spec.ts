/**
 * E2E tests: Responsive layout for all landing pages.
 *
 * Covers:
 * - All 17 pages at 375px mobile viewport: no horizontal overflow
 * - Hamburger menu opens at mobile viewport (home, /facilities, /services)
 * - Arabic RTL layout at 375px: no horizontal overflow
 * - All 17 pages at 768px tablet viewport: no horizontal overflow
 *
 * @see PRO-190
 */

import { test, expect } from "@playwright/test";
import { LANDING_PAGES } from "./helpers";

// ─── Mobile: no horizontal overflow ─────────────────────────────────────────

test.describe("Responsive — mobile no overflow (375px)", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  for (const lp of LANDING_PAGES) {
    test(`${lp.name}: no horizontal overflow at 375px`, async ({ page }) => {
      await page.goto(lp.path);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
      );
      expect(overflow, `${lp.path} has horizontal overflow at 375px`).toBe(
        false,
      );
    });
  }
});

// ─── Mobile: hamburger menu ──────────────────────────────────────────────────

test.describe("Responsive — hamburger menu opens at 375px", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  const HAMBURGER_PAGES = [
    { path: "/", name: "Home" },
    { path: "/facilities", name: "Facilities" },
    { path: "/services", name: "Services" },
    { path: "/first-nations", name: "First Nations" },
  ] as const;

  for (const lp of HAMBURGER_PAGES) {
    test(`${lp.name}: hamburger button is visible and opens nav links`, async ({
      page,
    }) => {
      await page.goto(lp.path);
      const nav = page.getByRole("navigation");
      const menuBtn = nav.getByRole("button", { name: /navigation menu/i });

      await expect(menuBtn).toBeVisible();

      await expect(async () => {
        await menuBtn.click();
        await expect(nav.getByRole("link", { name: /facilities/i })).toBeVisible({
          timeout: 1_000,
        });
      }).toPass({ timeout: 15_000 });
    });
  }
});

// ─── Mobile: RTL layout (Arabic) ─────────────────────────────────────────────

test.describe("Responsive — RTL layout at 375px (Arabic)", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  const RTL_PATHS = [
    { path: "/ar/", name: "Arabic Home" },
    { path: "/ar/facilities", name: "Arabic Facilities" },
    { path: "/ar/faq", name: "Arabic FAQ" },
  ] as const;

  for (const lp of RTL_PATHS) {
    test(`${lp.name}: dir=rtl and no horizontal overflow at 375px`, async ({
      page,
    }) => {
      await page.goto(lp.path);
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
      );
      expect(overflow, `${lp.path} has horizontal overflow at 375px (RTL)`).toBe(
        false,
      );
    });
  }
});

// ─── Tablet: no horizontal overflow ─────────────────────────────────────────

test.describe("Responsive — tablet no overflow (768px)", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  for (const lp of LANDING_PAGES) {
    test(`${lp.name}: no horizontal overflow at 768px`, async ({ page }) => {
      await page.goto(lp.path);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth + 1,
      );
      expect(overflow, `${lp.path} has horizontal overflow at 768px`).toBe(
        false,
      );
    });
  }
});
