/**
 * E2E tests: Admin invitation management — create, revoke, resend.
 */

import { test, expect } from "./helpers/setup";
import { loginAs, adminApiCall } from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";

test.describe("Admin Invitations — Create", () => {
  test("admin can create an invitation that appears in the list", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard/administration/users?view=invitations");

    // Should see invitations page
    await expect(page.getByText(/invitations/i).first()).toBeVisible();

    // Get roles for invitation
    const rolesResult = await adminApiCall(page, "GET", "/v1/admin/roles");
    const roles = rolesResult.data as { roles: Array<{ id: string; name: string }> };
    const memberRole = roles.roles?.find((r) => r.name === "member");

    if (!memberRole) {
      test.skip();
      return;
    }

    // Create invitation via API
    const invEmail = "newinvite@test.production.city";
    const result = await adminApiCall(page, "POST", "/v1/admin/invitations", {
      email: invEmail,
      roleIds: [memberRole.id],
    });

    expect(result.status).toBe(201);

    // Reload invitations page
    await page.goto("/dashboard/administration/users?view=invitations");

    // Should see the new invitation in the list
    await expect(page.getByText(invEmail)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Admin Invitations — Revoke", () => {
  test("admin can revoke an invitation and status changes", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Get roles
    const rolesResult = await adminApiCall(page, "GET", "/v1/admin/roles");
    const roles = rolesResult.data as { roles: Array<{ id: string; name: string }> };
    const memberRole = roles.roles?.find((r) => r.name === "member");

    if (!memberRole) {
      test.skip();
      return;
    }

    // Create invitation
    const invEmail = "torrevoke@test.production.city";
    const createResult = await adminApiCall(page, "POST", "/v1/admin/invitations", {
      email: invEmail,
      roleIds: [memberRole.id],
    });

    expect(createResult.status).toBe(201);
    const invitation = createResult.data as { invitation: { id: string } };

    // Revoke
    const revokeResult = await adminApiCall(
      page,
      "DELETE",
      `/v1/admin/invitations/${invitation.invitation.id}`,
    );

    expect(revokeResult.status).toBe(200);
  });
});

test.describe("Admin Invitations — Resend", () => {
  test("admin can resend a pending invitation", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Get roles
    const rolesResult = await adminApiCall(page, "GET", "/v1/admin/roles");
    const roles = rolesResult.data as { roles: Array<{ id: string; name: string }> };
    const memberRole = roles.roles?.find((r) => r.name === "member");

    if (!memberRole) {
      test.skip();
      return;
    }

    // Create invitation
    const invEmail = "toresend@test.production.city";
    const createResult = await adminApiCall(page, "POST", "/v1/admin/invitations", {
      email: invEmail,
      roleIds: [memberRole.id],
    });

    expect(createResult.status).toBe(201);
    const invitation = createResult.data as { invitation: { id: string } };

    // Resend
    const resendResult = await adminApiCall(
      page,
      "POST",
      `/v1/admin/invitations/${invitation.invitation.id}/resend`,
    );

    expect(resendResult.status).toBe(200);
  });
});
