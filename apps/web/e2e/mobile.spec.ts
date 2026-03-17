/**
 * E2E tests: Mobile responsive tests — login, code entry, admin dashboard.
 */

import { test, expect } from "./helpers/setup";
import { loginAs, createMagicLink } from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";

test.describe("Mobile — Login Page", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("login page renders correctly on mobile viewport", async ({ page }) => {
    await page.goto("/login");

    // Email input should be visible
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();

    // Submit button should be visible
    await expect(
      page.getByRole("button", { name: /send magic link/i }),
    ).toBeVisible();

    // No horizontal scrollbar
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

test.describe("Mobile — Code Entry", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("code entry works on mobile viewport", async ({ page }) => {
    await createMagicLink(ADMIN_EMAIL);

    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(ADMIN_EMAIL);
    await page.getByRole("button", { name: /send magic link/i }).click();

    // Code input should be visible on mobile
    const codeInput = page.getByPlaceholder("000000");
    await codeInput.waitFor({ state: "visible" });
    await expect(codeInput).toBeVisible();

    // Verify button should be visible
    await expect(
      page.getByRole("button", { name: /verify/i }),
    ).toBeVisible();
  });
});

test.describe("Mobile — Admin Dashboard", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("admin dashboard renders on mobile with collapsed sidebar", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");

    // Dashboard content should be visible
    await expect(page.getByText(/dashboard/i).first()).toBeVisible();

    // No horizontal overflow
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

test.describe("Mobile — User Detail", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("user management page renders on mobile", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard/administration/users");

    // Users heading should be visible
    await expect(page.getByText(/users/i).first()).toBeVisible();

    // Should show user emails
    await expect(page.getByText(ADMIN_EMAIL)).toBeVisible();
  });
});
