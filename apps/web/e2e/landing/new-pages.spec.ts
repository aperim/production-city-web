/**
 * E2E smoke tests: public landing pages from PRO-93 (hidden pages excluded per PRO-486).
 * Validates each route returns 200, renders an h1, and displays its primary heading.
 */

import { test, expect } from "@playwright/test";

const NEW_PAGES = [
  {
    path: "/services",
    name: "Services",
    heading: /From script to delivery/i,
  },
  {
    path: "/company",
    name: "Company",
    heading: /A first site, not a branch/i,
  },
  {
    path: "/first-nations",
    name: "First Nations",
    heading: /Embedded, not added on/i,
  },
  {
    path: "/facilities/broadcast-control-room",
    name: "Broadcast Control Room",
    heading: /The nerve centre/i,
  },
  {
    path: "/facilities/broadcast-theatre",
    name: "Broadcast Theatre",
    heading: /A live theatre wired as a broadcast studio/i,
  },
  {
    path: "/facilities/commercial-sound-stages",
    name: "Commercial Sound Stages",
    heading: /Small footprint/i,
  },
  {
    path: "/facilities/screen-sound-stages",
    name: "Screen Sound Stages",
    heading: /Grand-scale screen work/i,
  },
] as const;

test.describe("New landing pages — status and structure", () => {
  for (const pg of NEW_PAGES) {
    test(`${pg.name}: returns 200 and renders main landmark`, async ({ page }) => {
      const response = await page.goto(pg.path);
      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);
      await expect(page.getByRole("main")).toBeVisible();
    });

    test(`${pg.name}: renders h1 with expected heading`, async ({ page }) => {
      await page.goto(pg.path);
      const h1 = page.locator("h1");
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(pg.heading);
    });

    test(`${pg.name}: has <title> containing Production City`, async ({ page }) => {
      await page.goto(pg.path);
      const title = await page.title();
      expect(title).toContain("Production City");
    });
  }
});

test.describe("New landing pages — navigation and footer", () => {
  for (const pg of NEW_PAGES) {
    test(`${pg.name}: renders nav and footer landmarks`, async ({ page }) => {
      await page.goto(pg.path);
      await expect(page.getByRole("navigation")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
    });
  }
});

test.describe("Hidden pages — redirects to home (PRO-486)", () => {
  const HIDDEN_PATHS = [
    "/company/team",
    "/vision",
    "/network",
    "/community",
    "/company/approach",
    "/creative",
  ] as const;

  for (const hiddenPath of HIDDEN_PATHS) {
    test(`${hiddenPath} redirects to home`, async ({ page }) => {
      const response = await page.goto(hiddenPath);
      expect(response).not.toBeNull();
      expect(response!.status()).toBe(200);
      expect(page.url()).toMatch(/\/$/);
    });
  }
});
