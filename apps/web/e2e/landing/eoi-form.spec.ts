/**
 * E2E tests: EOI form flows.
 * Validates form presence, fields, consent, and submission states.
 */

import { test, expect } from "@playwright/test";
import { LANDING_PAGES } from "./helpers";

const PAGES_WITH_EOI = LANDING_PAGES.filter(
  (p) => p.path !== "/faq",
);

test.describe("EOI form presence", () => {
  for (const lp of PAGES_WITH_EOI) {
    test(`${lp.name} page has EOI section`, async ({ page }) => {
      await page.goto(lp.path);
      await expect(page.locator("#eoi-section")).toBeVisible();
    });
  }
});

test.describe("EOI form fields", () => {
  test("form has all required fields", async ({ page }) => {
    await page.goto("/contact");

    // Name field
    const nameInput = page.locator("#eoi-name");
    await expect(nameInput).toBeVisible();

    // Email field
    const emailInput = page.locator("#eoi-email");
    await expect(emailInput).toBeVisible();

    // Category select
    const categorySelect = page.locator("#eoi-category");
    await expect(categorySelect).toBeVisible();

    // Consent checkbox
    const consent = page.locator("#eoi-consent");
    await expect(consent).toBeVisible();

    // Submit button
    await expect(page.getByRole("button", { name: /submit/i })).toBeVisible();
  });

  test("form has all 6 category options", async ({ page }) => {
    await page.goto("/contact");
    const select = page.locator("#eoi-category");
    const options = select.locator("option");
    await expect(options).toHaveCount(6);
  });
});

test.describe("EOI form labels", () => {
  test("all form fields have associated labels", async ({ page }) => {
    await page.goto("/contact");

    // Name has label
    const nameLabel = page.locator('label[for="eoi-name"]');
    await expect(nameLabel).toBeVisible();

    // Email has label
    const emailLabel = page.locator('label[for="eoi-email"]');
    await expect(emailLabel).toBeVisible();

    // Category has label
    const catLabel = page.locator('label[for="eoi-category"]');
    await expect(catLabel).toBeVisible();

    // Consent has label
    const consentLabel = page.locator('label[for="eoi-consent"]');
    await expect(consentLabel).toBeVisible();
  });
});

test.describe("EOI category pre-selection", () => {
  const categoryTests = [
    { page: "/", expected: "general" },
    { page: "/contact?category=producer", expected: "producer" },
    { page: "/contact?category=creative", expected: "creative" },
    { page: "/contact?category=education", expected: "education" },
    { page: "/contact?category=investor", expected: "investor" },
    { page: "/contact?category=partner", expected: "partner" },
  ];

  for (const ct of categoryTests) {
    test(`category pre-selected on ${ct.page}`, async ({ page }) => {
      await page.goto(ct.page);
      const select = page.locator("#eoi-category");
      await expect(select).toHaveValue(ct.expected);
    });
  }
});

test.describe("EOI form keyboard accessibility", () => {
  test("form is navigable with Tab key", async ({ page }) => {
    await page.goto("/contact");
    const eoiSection = page.locator("#eoi-section");
    await eoiSection.scrollIntoViewIfNeeded();

    // Focus name input and tab through
    const nameInput = page.locator("#eoi-name");
    await nameInput.focus();
    await expect(nameInput).toBeFocused();

    // Tab to email
    await page.keyboard.press("Tab");
    await expect(page.locator("#eoi-email")).toBeFocused();
  });
});
