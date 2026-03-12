import { test, expect } from "@playwright/test";

test("holding page: title contains Production City", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Production City/);
});

test("holding page: main landmark is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();
});

test("holding page: Coming Soon text is present", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Coming Soon/i)).toBeVisible();
});

test("holding page: no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("/");
  expect(errors).toHaveLength(0);
});
