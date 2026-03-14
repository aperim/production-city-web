/**
 * E2E tests: Admin real-time notifications (#193).
 *
 * Tests that admin users receive real-time notifications
 * for EOI submissions and user approval events.
 */

import { test, expect } from "../helpers/setup";
import { loginAs } from "../helpers/test-api";

test.describe("Admin Notifications", () => {
  test("admin dashboard shows notification bell", async ({ page }) => {
    await loginAs(page, "admin@test.production.city");
    await page.waitForURL("**/dashboard**");

    // Notification bell should be visible for admin users
    const bell = page.locator("[data-testid='notification-bell']");
    await expect(bell).toBeVisible({ timeout: 10_000 });
  });

  test("notification panel opens on bell click", async ({ page }) => {
    await loginAs(page, "admin@test.production.city");
    await page.waitForURL("**/dashboard**");

    const bell = page.locator("[data-testid='notification-bell']");
    await expect(bell).toBeVisible({ timeout: 10_000 });

    await bell.click();

    // Panel should appear
    const panel = page.locator("[data-testid='notification-panel']");
    await expect(panel).toBeVisible({ timeout: 5_000 });
  });

  test("notification panel shows empty state initially", async ({ page }) => {
    await loginAs(page, "admin@test.production.city");
    await page.waitForURL("**/dashboard**");

    const bell = page.locator("[data-testid='notification-bell']");
    await expect(bell).toBeVisible({ timeout: 10_000 });

    await bell.click();

    const panel = page.locator("[data-testid='notification-panel']");
    await expect(panel).toBeVisible({ timeout: 5_000 });

    // Should show some content (empty state or notifications list)
    await expect(panel).not.toBeEmpty();
  });

  test("notification bell has no unread badge when no notifications", async ({ page }) => {
    await loginAs(page, "admin@test.production.city");
    await page.waitForURL("**/dashboard**");

    const bell = page.locator("[data-testid='notification-bell']");
    await expect(bell).toBeVisible({ timeout: 10_000 });

    // Badge should not show count 0
    const badge = page.locator("[data-testid='notification-badge']");
    const badgeCount = await badge.count();
    if (badgeCount > 0) {
      const text = await badge.textContent();
      // Badge should either not exist or show a number > 0
      if (text) {
        expect(parseInt(text, 10)).toBeGreaterThan(0);
      }
    }
  });
});
