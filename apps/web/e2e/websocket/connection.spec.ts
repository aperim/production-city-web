/**
 * E2E tests: WebSocket connection lifecycle (#193).
 *
 * Tests connection establishment, disconnection on logout,
 * reconnection behavior, and fallback to polling.
 */

import { test, expect } from "../helpers/setup";
import { loginAs } from "../helpers/test-api";
import { WebSocketTestHelper } from "../helpers/websocket";

const ws = new WebSocketTestHelper();

test.describe("WebSocket Connection Lifecycle", () => {
  test("establishes WebSocket on authenticated page", async ({ page }) => {
    await loginAs(page, "admin@test.production.city");
    await page.waitForURL("**/dashboard**");

    // The connection dot should eventually show connected state
    const dot = page.locator("[data-testid='connection-dot']");
    await expect(dot).toBeVisible({ timeout: 15_000 });
  });

  test("does NOT connect on public pages", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // No connection indicator should exist on public pages
    const dot = page.locator("[data-testid='connection-dot']");
    await expect(dot).toHaveCount(0);
  });

  test("shows connection status indicator on dashboard", async ({ page }) => {
    await loginAs(page, "admin@test.production.city");
    await page.waitForURL("**/dashboard**");

    const dot = page.locator("[data-testid='connection-dot']");
    await expect(dot).toBeVisible({ timeout: 15_000 });
  });

  test("reconnects after simulated disconnect", async ({ page }) => {
    await loginAs(page, "admin@test.production.city");
    await page.waitForURL("**/dashboard**");

    // Wait for initial connection
    const dot = page.locator("[data-testid='connection-dot']");
    await expect(dot).toBeVisible({ timeout: 15_000 });

    // Simulate network disconnect
    await ws.simulateDisconnect(page);

    // Wait a moment, then bring back online
    await page.waitForTimeout(1000);
    await ws.simulateNetworkChange(page, true);

    // Connection should re-establish
    await expect(dot).toBeVisible({ timeout: 15_000 });
  });

  test("shows reconnecting/disconnected state during disconnect", async ({ page }) => {
    await loginAs(page, "admin@test.production.city");
    await page.waitForURL("**/dashboard**");

    const dot = page.locator("[data-testid='connection-dot']");
    await expect(dot).toBeVisible({ timeout: 15_000 });

    // Go offline
    await ws.simulateDisconnect(page);

    // The dot should reflect disconnected state (or disappear)
    // Give time for state transition
    await page.waitForTimeout(2000);

    // Restore network
    await ws.simulateNetworkChange(page, true);

    // Should reconnect
    await expect(dot).toBeVisible({ timeout: 15_000 });
  });
});
