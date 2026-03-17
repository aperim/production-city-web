import { test, expect } from "@playwright/test";

test("homepage loads and returns 200 @smoke", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
  await expect(page.locator("html")).toBeVisible();
});

test("security headers are present on response @smoke", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();

  const headers = response!.headers();
  expect(headers["content-security-policy"]).toBeDefined();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
});

test("robots.txt allows indexing with sitemap @smoke", async ({ page }) => {
  const response = await page.goto("/robots.txt");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
  const body = await response!.text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap:");
});
