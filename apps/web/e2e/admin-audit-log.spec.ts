/**
 * E2E tests: Admin audit log — list, filter by action, date range, cursor pagination.
 */

import { test, expect } from "./helpers/setup";
import { loginAs, adminApiCall } from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";

test.describe("Admin Audit Log — Actions Appear", () => {
  test("auth actions appear in the audit log", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // The login itself should have created audit log entries
    const result = await adminApiCall(page, "GET", "/v1/admin/audit-log");
    expect(result.status).toBe(200);

    const data = result.data as { entries: Array<{ action: string }> };
    expect(data.entries.length).toBeGreaterThan(0);

    // Navigate to audit log page
    await page.goto("/dashboard/audit-log");
    await expect(page.getByText(/audit/i).first()).toBeVisible();
  });
});

test.describe("Admin Audit Log — Filter by Action", () => {
  test("filtering by action type returns correct results", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Filter by login action
    const result = await adminApiCall(
      page,
      "GET",
      "/v1/admin/audit-log?action=auth.login",
    );
    expect(result.status).toBe(200);

    const data = result.data as { entries: Array<{ action: string }> };
    for (const entry of data.entries) {
      expect(entry.action).toBe("auth.login");
    }
  });
});

test.describe("Admin Audit Log — Date Range Filter", () => {
  test("date range filter returns correct results", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const result = await adminApiCall(
      page,
      "GET",
      `/v1/admin/audit-log?startDate=${oneHourAgo.toISOString()}&endDate=${now.toISOString()}`,
    );
    expect(result.status).toBe(200);

    const data = result.data as {
      entries: Array<{ createdAt: string }>;
    };

    for (const entry of data.entries) {
      const entryDate = new Date(entry.createdAt);
      expect(entryDate.getTime()).toBeGreaterThanOrEqual(oneHourAgo.getTime());
      expect(entryDate.getTime()).toBeLessThanOrEqual(now.getTime());
    }
  });
});

test.describe("Admin Audit Log — Cursor Pagination", () => {
  test("cursor pagination returns next page", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // First page with small limit
    const page1 = await adminApiCall(
      page,
      "GET",
      "/v1/admin/audit-log?limit=2",
    );
    expect(page1.status).toBe(200);

    const data1 = page1.data as {
      entries: Array<{ id: string }>;
      nextCursor: string | null;
      hasMore: boolean;
    };

    if (data1.hasMore && data1.nextCursor) {
      // Fetch next page
      const page2 = await adminApiCall(
        page,
        "GET",
        `/v1/admin/audit-log?limit=2&cursor=${encodeURIComponent(data1.nextCursor)}`,
      );
      expect(page2.status).toBe(200);

      const data2 = page2.data as { entries: Array<{ id: string }> };

      // Entries should be different
      if (data2.entries.length > 0 && data1.entries.length > 0) {
        expect(data2.entries[0]!.id).not.toBe(data1.entries[0]!.id);
      }
    }
  });
});
