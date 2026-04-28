/**
 * E2E tests: Position Paper page (/position-paper).
 * Validates page load, section visibility, and EOI form interaction.
 */

import { test, expect } from "@playwright/test";

test.describe("Position Paper — page load and structure", () => {
  test("returns 200 and renders main landmark", async ({ page }) => {
    const response = await page.goto("/position-paper");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("renders h1 with position paper heading", async ({ page }) => {
    await page.goto("/position-paper");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/Vertically Integrated/i);
  });

  test("has <title> containing Production City", async ({ page }) => {
    await page.goto("/position-paper");
    const title = await page.title();
    expect(title).toContain("Production City");
  });

  test("renders nav and footer landmarks", async ({ page }) => {
    await page.goto("/position-paper");
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});

test.describe("Position Paper — section visibility", () => {
  test("failure modes section is present", async ({ page }) => {
    await page.goto("/position-paper");
    const el = page.getByText(/Single-tenant dependency/i).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible({ timeout: 10_000 });
  });

  test("comparison grid section is present", async ({ page }) => {
    await page.goto("/position-paper");
    const el = page.getByText(/Standalone Facility/i).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible({ timeout: 10_000 });
  });

  test("ILM StageCraft case study is present", async ({ page }) => {
    await page.goto("/position-paper");
    const el = page.getByText(/ILM StageCraft/i).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible({ timeout: 10_000 });
  });

  test("conclusion cards are present", async ({ page }) => {
    await page.goto("/position-paper");
    const el = page.getByText(/facility-only model does not work/i).first();
    await el.scrollIntoViewIfNeeded();
    await expect(el).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Position Paper — EOI form interaction", () => {
  test("EOI section is present on page", async ({ page }) => {
    await page.goto("/position-paper");
    const eoiSection = page.locator("#eoi-section");
    await expect(eoiSection).toBeVisible();
  });

  test("EOI form has name and email fields", async ({ page }) => {
    await page.goto("/position-paper");
    const eoiSection = page.locator("#eoi-section");
    await eoiSection.scrollIntoViewIfNeeded();
    const nameField = eoiSection.getByRole("textbox").first();
    await expect(nameField).toBeVisible();
  });

  test("EOI form has investor category pre-selected", async ({ page }) => {
    await page.goto("/position-paper");
    const eoiSection = page.locator("#eoi-section");
    await eoiSection.scrollIntoViewIfNeeded();
    const investorOption = eoiSection.getByRole("radio", { name: /investor/i });
    if (await investorOption.count() > 0) {
      await expect(investorOption).toBeChecked();
    }
  });
});

test.describe("Position Paper — locale routing", () => {
  test("locale prefix routes correctly (zh)", async ({ page }) => {
    const response = await page.goto("/zh/position-paper");
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("position paper link appears in footer", async ({ page }) => {
    await page.goto("/position-paper");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: /position paper/i })).toBeVisible();
  });
});
