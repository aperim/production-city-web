/**
 * E2E tests: /masterplan page — Phase 5 accessibility, mobile, and viewer integration.
 *
 * @see PRO-301
 */

import { test, expect } from "@playwright/test";

// ─── Page loads and heading hierarchy ────────────────────────────────────────

test.describe("Masterplan — page load", () => {
  test("returns 200 and renders h1", async ({ page }) => {
    const response = await page.goto("/masterplan");
    expect(response?.status()).toBe(200);

    const h1 = page.locator("h1");
    await expect(h1.first()).toBeVisible();
    await expect(h1.first()).toContainText(/campus masterplan/i);
  });

  test("has Production City in <title>", async ({ page }) => {
    await page.goto("/masterplan");
    const title = await page.title();
    expect(title).toContain("Production City");
  });
});

// ─── Viewer container accessibility ─────────────────────────────────────────

test.describe("Masterplan — 3D viewer accessibility", () => {
  test("viewer region has role=img and aria-label", async ({ page }) => {
    await page.goto("/masterplan");
    // Wait for the section to be in the DOM (lazy Suspense resolves)
    await expect(
      page.locator('[role="img"][aria-label*="masterplan"]'),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("heading overlay renders over viewer", async ({ page }) => {
    await page.goto("/masterplan");
    await expect(
      page.locator("h1#masterplan-page-heading"),
    ).toBeVisible();
  });
});

// ─── No horizontal overflow ───────────────────────────────────────────────────

test.describe("Masterplan — no horizontal overflow (desktop)", () => {
  test("no overflow at 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/masterplan");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});

// ─── Mobile viewport ─────────────────────────────────────────────────────────

test.describe("Masterplan — mobile viewport (375px)", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("no horizontal overflow at 375px", async ({ page }) => {
    await page.goto("/masterplan");
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    );
    expect(overflow, "Masterplan has horizontal overflow at 375px").toBe(false);
  });

  test("viewer container visible on mobile", async ({ page }) => {
    await page.goto("/masterplan");
    // Viewer hero section must be visible — may show the shimmer or the 3D canvas
    const hero = page.locator(
      "section[aria-labelledby='masterplan-page-heading']",
    );
    await expect(hero).toBeVisible();
  });

  test("facility highlights render at mobile", async ({ page }) => {
    await page.goto("/masterplan");
    const highlights = page.locator(
      "section[aria-labelledby='facility-highlights-heading']",
    );
    await expect(highlights).toBeVisible();
  });
});

// ─── prefers-reduced-motion ───────────────────────────────────────────────────

test.describe("Masterplan — prefers-reduced-motion", () => {
  test("page loads without error when reduced motion is preferred", async ({
    page,
  }) => {
    // Emulate the CSS media feature
    await page.emulateMedia({ reducedMotion: "reduce" });

    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const response = await page.goto("/masterplan");
    expect(response?.status()).toBe(200);

    // Heading must still render — viewer disables auto-rotate but page remains functional
    await expect(page.locator("h1#masterplan-page-heading")).toBeVisible();

    expect(errors).toHaveLength(0);
  });
});

// ─── Facility highlights and EOI ─────────────────────────────────────────────

test.describe("Masterplan — page sections", () => {
  test("campus stats strip renders", async ({ page }) => {
    await page.goto("/masterplan");
    await expect(
      page.locator("section[aria-labelledby='campus-stats-heading']"),
    ).toBeVisible();
  });

  test("EOI section present", async ({ page }) => {
    await page.goto("/masterplan");
    await page.locator("#eoi-section").scrollIntoViewIfNeeded();
    await expect(page.locator("#eoi-section")).toBeVisible();
  });

  test("forward-looking disclaimer renders", async ({ page }) => {
    await page.goto("/masterplan");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(
      page.locator("text=/forward-looking/i").first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});
