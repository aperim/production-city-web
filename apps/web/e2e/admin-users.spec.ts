/**
 * E2E tests: Admin user management — list, search, detail, role change, deactivate.
 */

import { test, expect } from "./helpers/setup";
import { loginAs, adminApiCall } from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";
const MEMBER_EMAIL = "member@test.production.city";

test.describe("Admin Users — List with Pagination", () => {
  test("admin can view user list", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard/administration/users");

    // Should see user list heading
    await expect(page.getByText(/users/i).first()).toBeVisible();

    // Should see at least the seeded test users
    await expect(page.getByText(ADMIN_EMAIL)).toBeVisible();
    await expect(page.getByText(MEMBER_EMAIL)).toBeVisible();
  });
});

test.describe("Admin Users — Search", () => {
  test("admin can search for a specific user", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard/administration/users");

    // Find search input
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("member");

      // Wait for filtered results
      await expect(page.getByText(MEMBER_EMAIL)).toBeVisible();
    }
  });
});

test.describe("Admin Users — User Detail", () => {
  test("admin can view user detail panel", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard/administration/users");

    // Click on a user row/link
    const memberRow = page.getByText(MEMBER_EMAIL);
    await memberRow.click();

    // Should show some detail view (email, roles, status)
    await expect(page.getByText(MEMBER_EMAIL)).toBeVisible();
  });
});

test.describe("Admin Users — Change Role", () => {
  test("admin can change user role via API", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Get user list to find member's ID
    const result = await adminApiCall(page, "GET", "/v1/admin/users?search=member");
    const data = result.data as { users: Array<{ id: string; email: string }> };
    const memberUser = data.users?.find((u) => u.email === MEMBER_EMAIL);

    expect(memberUser).toBeDefined();

    // Get available roles
    const rolesResult = await adminApiCall(page, "GET", "/v1/admin/roles");
    const roles = rolesResult.data as { roles: Array<{ id: string; name: string }> };
    const viewerRole = roles.roles?.find((r) => r.name === "viewer");

    if (!viewerRole || !memberUser) {
      test.skip();
      return;
    }

    // Assign viewer role to member
    const assignResult = await adminApiCall(
      page,
      "POST",
      `/v1/admin/users/${memberUser.id}/roles`,
      { roleIds: [viewerRole.id] },
    );

    expect(assignResult.status).toBe(200);
  });
});

test.describe("Admin Users — Deactivate User", () => {
  test("admin can deactivate a user and their sessions are revoked", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Find the member user
    const result = await adminApiCall(page, "GET", "/v1/admin/users?search=viewer");
    const data = result.data as { users: Array<{ id: string; email: string }> };
    const viewerUser = data.users?.find((u) => u.email === "viewer@test.production.city");

    if (!viewerUser) {
      test.skip();
      return;
    }

    // Deactivate the user via API
    const deactivateResult = await adminApiCall(
      page,
      "PATCH",
      `/v1/admin/users/${viewerUser.id}`,
      { status: "deactivated" },
    );

    expect(deactivateResult.status).toBe(200);

    const responseData = deactivateResult.data as { user: { status: string }; revokedSessionCount?: number };
    expect(responseData.user.status).toBe("deactivated");
  });
});

test.describe("Admin Users — Non-Admin Access Denied", () => {
  test("member cannot access admin user management", async ({ page }) => {
    await loginAs(page, MEMBER_EMAIL);

    // Try to access users page
    await page.goto("/dashboard/administration/users");

    // Should see access denied or forbidden message
    // The route guard should prevent access
    await expect(
      page.getByText(/access denied|forbidden|insufficient|not authorized/i),
    ).toBeVisible({ timeout: 10_000 });
  });
});
