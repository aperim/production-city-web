import { test, expect } from "@playwright/test";

test("homepage loads and returns 200", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
  await expect(page.locator("html")).toBeVisible();
});

test("security headers are present on response", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();

  const headers = response!.headers();
  expect(headers["content-security-policy"]).toBeDefined();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
});

test("robots.txt disallows all indexing", async ({ page }) => {
  const response = await page.goto("/robots.txt");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
  const body = await response!.text();
  expect(body).toContain("Disallow: /");
});
