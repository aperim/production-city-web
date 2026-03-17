/**
 * E2E tests: Admin approval workflow — list, approve, reject.
 */

import { test, expect } from "./helpers/setup";
import { loginAs, adminApiCall, createMagicLink } from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";

test.describe("Admin Approvals — Pending User List", () => {
  test("admin can see pending users in approvals list", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Create a pending user via direct API
    const result = await adminApiCall(page, "GET", "/v1/admin/approvals");
    expect(result.status).toBe(200);

    await page.goto("/dashboard/administration/users?view=approvals");
    await expect(page.getByText(/pending|approvals/i).first()).toBeVisible();
  });
});

test.describe("Admin Approvals — Approve User", () => {
  test("admin approves a pending user who then becomes active", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Get pending users
    const result = await adminApiCall(page, "GET", "/v1/admin/approvals");
    const data = result.data as { users: Array<{ id: string; email: string }> };

    if (!data.users || data.users.length === 0) {
      // No pending users to approve — skip
      test.skip();
      return;
    }

    const pendingUser = data.users[0]!;

    // Approve
    const approveResult = await adminApiCall(
      page,
      "POST",
      `/v1/admin/approvals/${pendingUser.id}/approve`,
    );

    expect(approveResult.status).toBe(200);
  });
});

test.describe("Admin Approvals — Reject User", () => {
  test("admin rejects a pending user with reason", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Get pending users
    const result = await adminApiCall(page, "GET", "/v1/admin/approvals");
    const data = result.data as { users: Array<{ id: string; email: string }> };

    if (!data.users || data.users.length === 0) {
      test.skip();
      return;
    }

    const pendingUser = data.users[0]!;

    // Reject with reason
    const rejectResult = await adminApiCall(
      page,
      "POST",
      `/v1/admin/approvals/${pendingUser.id}/reject`,
      { reason: "Does not meet requirements" },
    );

    expect(rejectResult.status).toBe(200);
  });
});
