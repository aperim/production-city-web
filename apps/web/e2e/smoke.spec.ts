import { test, expect } from "@playwright/test";

test("homepage loads and returns 200", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
  await expect(page.locator("html")).toBeVisible();
});

test("SPA fallback: unknown path returns 200", async ({ page }) => {
  const response = await page.goto("/some/unknown/path");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
});
