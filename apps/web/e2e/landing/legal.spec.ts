/**
 * E2E tests: Legal pages — Privacy Policy, Terms of Use, Cookie Policy.
 *
 * Validates each legal page:
 * - Loads without error (200)
 * - Renders an h1 with the page title
 * - Contains required legal content sections
 * - Footer legal links are present and point to correct paths
 *
 * @see PRO-325
 */

import { test, expect } from "@playwright/test";

// ─── Page smoke tests ─────────────────────────────────────────────────────────

test.describe("Privacy Policy page", () => {
  test("loads and renders h1", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/privacy policy/i);
  });

  test("contains key privacy sections", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("main")).toBeVisible();
    // Must have at least a heading about information collection
    await expect(
      page.getByRole("main").getByText(/information we collect/i),
    ).toBeVisible();
  });

  test("back to home link navigates correctly", async ({ page }) => {
    await page.goto("/privacy");
    const backLink = page.getByRole("main").getByRole("link", { name: /home/i });
    await expect(backLink).toBeAttached();
    const href = await backLink.getAttribute("href");
    expect(href).toMatch(/^\//);
  });
});

test.describe("Terms of Use page", () => {
  test("loads and renders h1", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/terms of use/i);
  });

  test("contains key terms sections", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(
      page.getByRole("main").getByText(/use of this website/i),
    ).toBeVisible();
  });

  test("back to home link is present", async ({ page }) => {
    await page.goto("/terms");
    const backLink = page.getByRole("main").getByRole("link", { name: /home/i });
    await expect(backLink).toBeAttached();
  });
});

test.describe("Cookie Policy page", () => {
  test("loads and renders h1", async ({ page }) => {
    await page.goto("/cookies");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/cookie policy/i);
  });

  test("contains cookies we use section", async ({ page }) => {
    await page.goto("/cookies");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(
      page.getByRole("main").getByText(/cookies we use/i),
    ).toBeVisible();
  });

  test("links to Privacy Policy", async ({ page }) => {
    await page.goto("/cookies");
    const privacyLink = page
      .getByRole("main")
      .getByRole("link", { name: /privacy policy/i });
    await expect(privacyLink).toBeAttached();
    const href = await privacyLink.getAttribute("href");
    expect(href).toContain("/privacy");
  });

  test("back to home link is present", async ({ page }) => {
    await page.goto("/cookies");
    const backLink = page.getByRole("main").getByRole("link", { name: /home/i });
    await expect(backLink).toBeAttached();
  });
});

// ─── Footer legal links ───────────────────────────────────────────────────────

test.describe("Footer — legal links", () => {
  test("footer contains Privacy Policy link pointing to /privacy", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const link = footer.getByRole("link", { name: /privacy policy/i }).first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toContain("/privacy");
  });

  test("footer contains Terms of Use link pointing to /terms", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const link = footer.getByRole("link", { name: /terms of use/i }).first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toContain("/terms");
  });

  test("footer contains Cookie Policy link pointing to /cookies", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const link = footer.getByRole("link", { name: /cookie policy/i }).first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toContain("/cookies");
  });

  test("clicking footer Privacy Policy link navigates to /privacy", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("link", { name: /privacy policy/i }).first().click();
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("clicking footer Terms of Use link navigates to /terms", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("link", { name: /terms of use/i }).first().click();
    await expect(page).toHaveURL(/\/terms/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("clicking footer Cookie Policy link navigates to /cookies", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await footer.getByRole("link", { name: /cookie policy/i }).first().click();
    await expect(page).toHaveURL(/\/cookies/);
    await expect(page.getByRole("main")).toBeVisible();
  });
});

// ─── i18n locale routing ─────────────────────────────────────────────────────

test.describe("Legal pages — locale routing", () => {
  const LEGAL_PAGES = [
    { path: "/privacy", name: "Privacy Policy" },
    { path: "/terms", name: "Terms of Use" },
    { path: "/cookies", name: "Cookie Policy" },
  ] as const;

  for (const { path, name } of LEGAL_PAGES) {
    test(`${name} loads under /zh locale`, async ({ page }) => {
      await page.goto(`/zh${path}`);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByRole("main")).toBeVisible();
    });
  }
});
