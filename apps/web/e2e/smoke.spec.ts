import { test, expect } from "@playwright/test";

test("homepage loads and returns 200", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
  await expect(page.locator("html")).toBeVisible();
});

test("page title contains Production City", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Production City/);
});

test("main landmark is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
});

test("Coming Soon text is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Coming soon.")).toBeVisible();
});

test("no console errors on page load", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  await page.goto("/");
  expect(errors).toEqual([]);
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
