/**
 * E2E tests: CTA buttons and footer link navigation for landing pages.
 *
 * Covers:
 * - CTA buttons on landing pages navigate to correct destinations
 * - Footer "Explore" group links navigate to correct pages
 * - Footer "Resources" group links navigate to correct pages
 * - Footer legal links present and pointed correctly
 * - Footer email/phone contact info links
 *
 * @see PRO-190
 */

import { test, expect } from "@playwright/test";

// ─── CTA button flows ────────────────────────────────────────────────────────

test.describe("CTA buttons — home page", () => {
  test("home page CTA navigates to EOI section on the page", async ({
    page,
  }) => {
    await page.goto("/");
    // The home page CTAs scroll to #eoi-section instead of navigating away
    const eoiSection = page.locator("#eoi-section");
    await expect(eoiSection).toBeAttached();

    // Find a CTA link that targets #eoi-section
    const ctaLink = page
      .getByRole("main")
      .locator('a[href="#eoi-section"]')
      .first();
    await expect(ctaLink).toBeAttached();
  });
});

test.describe("CTA buttons — facility detail pages", () => {
  const FACILITY_CTA_CASES = [
    {
      path: "/facilities/broadcast-control-room",
      name: "Broadcast Control Room",
      expectedUrlPattern: /\/contact/,
    },
    {
      path: "/facilities/broadcast-theatre",
      name: "Broadcast Theatre",
      expectedUrlPattern: /\/contact/,
    },
    {
      path: "/facilities/commercial-sound-stages",
      name: "Commercial Sound Stages",
      expectedUrlPattern: /\/contact/,
    },
    {
      path: "/facilities/screen-sound-stages",
      name: "Screen Sound Stages",
      expectedUrlPattern: /\/contact/,
    },
  ] as const;

  for (const tc of FACILITY_CTA_CASES) {
    test(`${tc.name}: primary CTA links to /contact`, async ({ page }) => {
      await page.goto(tc.path);
      // Find the first CTA link in main that points to /contact
      const ctaLink = page
        .getByRole("main")
        .locator('a[href*="/contact"]')
        .first();
      await expect(ctaLink).toBeAttached();
      const href = await ctaLink.getAttribute("href");
      expect(href).toMatch(tc.expectedUrlPattern);
    });
  }
});

test.describe("CTA buttons — other landing pages", () => {
  const OTHER_CTA_CASES = [
    { path: "/network", name: "Network" },
    { path: "/company", name: "Company" },
    { path: "/company/approach", name: "Company — Approach" },
    { path: "/first-nations", name: "First Nations" },
  ] as const;

  for (const tc of OTHER_CTA_CASES) {
    test(`${tc.name}: primary CTA links to /contact`, async ({ page }) => {
      await page.goto(tc.path);
      const ctaLink = page
        .getByRole("main")
        .locator('a[href*="/contact"]')
        .first();
      await expect(ctaLink).toBeAttached();
    });
  }

  test("FAQ 'contact us' link navigates to /contact", async ({ page }) => {
    await page.goto("/faq");
    // The FAQ page has a "Still have questions? Contact us." link
    const contactLink = page
      .getByRole("main")
      .locator('a[href*="/contact"]')
      .first();
    await expect(contactLink).toBeAttached();

    await contactLink.click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});

// ─── Footer link groups ───────────────────────────────────────────────────────

test.describe("Footer — Explore link group", () => {
  const EXPLORE_LINKS = [
    { label: /home/i, expectedPath: "/" },
    { label: /facilities/i, expectedPath: "/facilities" },
    { label: /services/i, expectedPath: "/services" },
    { label: /creative/i, expectedPath: "/creative" },
    { label: /vision/i, expectedPath: "/vision" },
    { label: /network/i, expectedPath: "/network" },
    { label: /community/i, expectedPath: "/community" },
  ] as const;

  for (const lk of EXPLORE_LINKS) {
    test(`footer "${lk.label.source}" link navigates to ${lk.expectedPath}`, async ({
      page,
    }) => {
      await page.goto("/");
      const footer = page.getByRole("contentinfo");
      const link = footer.getByRole("link", { name: lk.label }).first();
      await expect(link).toBeVisible();

      const href = await link.getAttribute("href");
      expect(href).toContain(lk.expectedPath);
    });
  }
});

test.describe("Footer — Resources link group", () => {
  const RESOURCE_LINKS = [
    { label: /company/i, expectedPath: "/company" },
    { label: /first nations/i, expectedPath: "/first-nations" },
    { label: /faq/i, expectedPath: "/faq" },
    { label: /contact/i, expectedPath: "/contact" },
  ] as const;

  for (const lk of RESOURCE_LINKS) {
    test(`footer "${lk.label.source}" link points to ${lk.expectedPath}`, async ({
      page,
    }) => {
      await page.goto("/");
      const footer = page.getByRole("contentinfo");
      const link = footer.getByRole("link", { name: lk.label }).first();
      await expect(link).toBeVisible();

      const href = await link.getAttribute("href");
      expect(href).toContain(lk.expectedPath);
    });
  }

  test("clicking footer FAQ link navigates to /faq", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("link", { name: /faq/i }).first().click();
    await expect(page).toHaveURL(/\/faq/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("clicking footer Contact link navigates to /contact", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("link", { name: /contact/i }).first().click();
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});

// ─── Footer contact info ──────────────────────────────────────────────────────

test.describe("Footer — contact information", () => {
  test("email link has correct mailto href", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const emailLink = footer.locator(
      'a[href="mailto:troy@team.production.city"]',
    );
    await expect(emailLink).toBeVisible();
  });
});

// ─── Footer legal links ───────────────────────────────────────────────────────
// Legal footer link tests are in legal.spec.ts (PRO-325).

// ─── Hamburger menu close and Escape key ─────────────────────────────────────

test.describe("Hamburger menu — close and navigate", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("close button inside mobile menu closes the overlay", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    const menuBtn = nav.getByRole("button", { name: /navigation menu/i });
    await expect(menuBtn).toBeVisible();

    // Open the menu
    await expect(async () => {
      await menuBtn.click();
      await expect(
        page.getByRole("dialog", { name: /navigation menu/i }),
      ).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });

    // Close via the close button
    const closeBtn = page.getByRole("dialog").getByRole("button", {
      name: /close menu/i,
    });
    await closeBtn.click();

    await expect(
      page.getByRole("dialog", { name: /navigation menu/i }),
    ).not.toBeVisible({ timeout: 5_000 });
  });

  test("Escape key closes the mobile menu overlay", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    const menuBtn = nav.getByRole("button", { name: /navigation menu/i });

    // Open the menu
    await expect(async () => {
      await menuBtn.click();
      await expect(
        page.getByRole("dialog", { name: /navigation menu/i }),
      ).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });

    // Close via Escape
    await page.keyboard.press("Escape");

    await expect(
      page.getByRole("dialog", { name: /navigation menu/i }),
    ).not.toBeVisible({ timeout: 5_000 });
  });

  test("clicking a link from the mobile menu navigates and closes overlay", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    const menuBtn = nav.getByRole("button", { name: /navigation menu/i });

    // Open the menu
    await expect(async () => {
      await menuBtn.click();
      await expect(
        page.getByRole("dialog", { name: /navigation menu/i }),
      ).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });

    // Click the Facilities link inside the overlay
    await page
      .getByRole("dialog")
      .getByRole("link", { name: /facilities/i })
      .click();

    // Should navigate to /facilities and the overlay should be gone
    await expect(page).toHaveURL(/\/facilities/);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(
      page.getByRole("dialog", { name: /navigation menu/i }),
    ).not.toBeVisible();
  });
});
