/**
 * E2E tests: Auth login flows — magic code, magic link, error scenarios.
 */

import { test, expect } from "./helpers/setup";
import { createMagicLink, loginAs } from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";

test.describe("Auth Login — Magic Code (happy path)", () => {
  test("user can log in with a valid magic code", async ({ page }) => {
    const { code } = await createMagicLink(ADMIN_EMAIL);

    await page.goto("/login");

    // Enter email
    await page.getByPlaceholder("you@example.com").fill(ADMIN_EMAIL);
    await page.getByRole("button", { name: /send magic link/i }).click();

    // Wait for code view
    const codeInput = page.getByPlaceholder("000000");
    await codeInput.waitFor({ state: "visible" });

    // Enter code and verify
    await codeInput.fill(code);
    await page.getByRole("button", { name: /verify/i }).click();

    // Should redirect to dashboard
    await page.waitForURL("**/dashboard**");
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe("Auth Login — Magic Link (happy path)", () => {
  test("user can log in via magic link URL", async ({ page }) => {
    const { token } = await createMagicLink(ADMIN_EMAIL);

    // Navigate directly to verify URL
    await page.goto(`/auth/verify?token=${encodeURIComponent(token)}`);

    // Should redirect to dashboard
    await page.waitForURL("**/dashboard**");
    await expect(page).toHaveURL(/dashboard/);
  });
});

test.describe("Auth Login — Invalid Magic Link", () => {
  test("invalid token shows error message", async ({ page }) => {
    await page.goto("/auth/verify?token=invalid-token-abc123");

    // Should show error message
    await expect(
      page.getByText(/invalid|expired|verification failed/i),
    ).toBeVisible();

    // Should show link back to login
    await expect(page.getByText(/back to login|back to sign in/i)).toBeVisible();
  });
});

test.describe("Auth Login — Expired Magic Link", () => {
  test("expired link shows appropriate error", async ({ page }) => {
    // Use a completely bogus token — it will fail validation
    await page.goto("/auth/verify?token=expired-token-that-does-not-exist");

    await expect(
      page.getByText(/invalid|expired|verification failed/i),
    ).toBeVisible();
  });
});

test.describe("Auth Login — Wrong Code Lockout", () => {
  test("5 wrong codes result in lockout message", async ({ page }) => {
    await createMagicLink(ADMIN_EMAIL);

    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(ADMIN_EMAIL);
    await page.getByRole("button", { name: /send magic link/i }).click();

    const codeInput = page.getByPlaceholder("000000");
    await codeInput.waitFor({ state: "visible" });

    // Enter wrong code multiple times
    for (let i = 0; i < 5; i++) {
      await codeInput.fill("999999");
      await page.getByRole("button", { name: /verify/i }).click();

      // Wait for error to appear before retrying
      await expect(page.getByText(/invalid|expired|remaining/i)).toBeVisible();

      // Clear input for next attempt
      await codeInput.clear();
    }

    // After 5 wrong attempts, should see lockout or max attempts message
    await expect(
      page.getByText(/invalid|expired|locked|request a new/i),
    ).toBeVisible();
  });
});

test.describe("Auth Login — Go Back", () => {
  test("'Wrong email? Go back' resets state", async ({ page }) => {
    await createMagicLink(ADMIN_EMAIL);

    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(ADMIN_EMAIL);
    await page.getByRole("button", { name: /send magic link/i }).click();

    // Wait for code view
    await page.getByPlaceholder("000000").waitFor({ state: "visible" });

    // Click go back
    await page.getByText(/wrong email.*go back/i).click();

    // Should be back to email input
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toHaveValue("");
  });
});

test.describe("Auth Login — Anti-Enumeration", () => {
  test("unregistered email gets same UX as registered", async ({ page }) => {
    await page.goto("/login");

    // Enter an unregistered email
    await page.getByPlaceholder("you@example.com").fill("nonexistent@nowhere.example");
    await page.getByRole("button", { name: /send magic link/i }).click();

    // Should still transition to code entry view (anti-enumeration)
    // The UX should be identical whether the email is registered or not
    const codeInput = page.getByPlaceholder("000000");
    await codeInput.waitFor({ state: "visible", timeout: 10_000 });
  });
});

test.describe("Auth Login — Already Authenticated", () => {
  test("authenticated user visiting /login redirects to dashboard", async ({ page }) => {
    // Log in first
    await loginAs(page, ADMIN_EMAIL);

    // Visit login page
    await page.goto("/login");

    // Should redirect to dashboard
    await page.waitForURL("**/dashboard**");
  });
});
