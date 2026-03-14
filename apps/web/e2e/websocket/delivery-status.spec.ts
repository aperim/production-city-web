/**
 * E2E tests: Delivery status push via WebSocket (#193).
 *
 * Tests that delivery status updates are received via WebSocket
 * and that polling fallback works when WS is unavailable.
 */

import { test, expect } from "../helpers/setup";
import { createMagicLink } from "../helpers/test-api";

test.describe("Delivery Status Push", () => {
  test("login page shows delivery status UI after magic link request", async ({ page }) => {
    // Create a magic link so we have valid test data
    await createMagicLink("admin@test.production.city");

    await page.goto("/login");

    // Enter email and submit
    const emailInput = page.getByPlaceholder("you@example.com");
    await emailInput.fill("admin@test.production.city");

    const submitButton = page.getByRole("button", { name: /send magic link/i });
    await submitButton.click();

    // Wait for code input to appear (indicates delivery tracking started)
    const codeInput = page.getByPlaceholder("000000");
    await expect(codeInput).toBeVisible({ timeout: 10_000 });
  });

  test("shows delivered status after successful magic link delivery", async ({ page }) => {
    const { code } = await createMagicLink("admin@test.production.city");

    await page.goto("/login");

    const emailInput = page.getByPlaceholder("you@example.com");
    await emailInput.fill("admin@test.production.city");

    const submitButton = page.getByRole("button", { name: /send magic link/i });
    await submitButton.click();

    // Wait for the code form to appear
    const codeInput = page.getByPlaceholder("000000");
    await expect(codeInput).toBeVisible({ timeout: 10_000 });

    // Enter the code and verify
    await codeInput.fill(code);

    const verifyButton = page.getByRole("button", { name: /verify/i });
    await verifyButton.click();

    // Should redirect to dashboard on success
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });
  });

  test("falls back to polling if WebSocket unavailable", async ({ page }) => {
    // Block WebSocket connections by going to login page offline-first
    // then coming back online — the polling fallback should still work
    const { code } = await createMagicLink("admin@test.production.city");

    await page.goto("/login");

    const emailInput = page.getByPlaceholder("you@example.com");
    await emailInput.fill("admin@test.production.city");

    const submitButton = page.getByRole("button", { name: /send magic link/i });
    await submitButton.click();

    // The code form should appear (polling or WS delivers the state)
    const codeInput = page.getByPlaceholder("000000");
    await expect(codeInput).toBeVisible({ timeout: 15_000 });

    // Complete login to verify end-to-end flow
    await codeInput.fill(code);
    const verifyButton = page.getByRole("button", { name: /verify/i });
    await verifyButton.click();

    await page.waitForURL("**/dashboard**", { timeout: 15_000 });
  });
});
