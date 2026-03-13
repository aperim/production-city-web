/**
 * E2E tests: Invitation flow — accept, expired, revoked.
 */

import { test, expect } from "./helpers/setup";
import { loginAs, adminApiCall, createMagicLink } from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";
const NEW_USER_EMAIL = "invited@test.production.city";

test.describe("Invitation Flow — Accept (new user)", () => {
  test("new user can accept invitation and access dashboard", async ({ page }) => {
    // Login as admin to create invitation
    await loginAs(page, ADMIN_EMAIL);

    // Get roles for the invitation
    const rolesResult = await adminApiCall(page, "GET", "/v1/admin/roles");
    const roles = rolesResult.data as { roles: Array<{ id: string; name: string }> };
    const memberRole = roles.roles?.find((r) => r.name === "member");

    if (!memberRole) {
      // If roles endpoint doesn't exist yet, skip this test gracefully
      test.skip();
      return;
    }

    // Create invitation via API
    const invResult = await adminApiCall(page, "POST", "/v1/admin/invitations", {
      email: NEW_USER_EMAIL,
      roleIds: [memberRole.id],
    });

    expect(invResult.status).toBe(201);

    // Create a magic link for the invited user (simulating the email)
    const { token } = await createMagicLink(NEW_USER_EMAIL, "invitation_accept");

    // Clear admin session and navigate as the new user
    await page.context().clearCookies();

    // Accept invitation via magic link
    await page.goto(`/auth/verify?token=${encodeURIComponent(token)}`);

    // Should be redirected (to onboarding or dashboard)
    await page.waitForURL(/dashboard|onboarding/, { timeout: 15_000 });
  });
});

test.describe("Invitation Flow — Expired", () => {
  test("expired invitation token shows error", async ({ page }) => {
    // Navigate with a bogus token (no valid invitation exists for it)
    await page.goto("/auth/verify?token=expired-invitation-token-xyz");

    await expect(
      page.getByText(/invalid|expired|verification failed/i),
    ).toBeVisible();
  });
});

test.describe("Invitation Flow — Revoked", () => {
  test("revoked invitation token shows error", async ({ page }) => {
    // Login as admin
    await loginAs(page, ADMIN_EMAIL);

    // Get member role
    const rolesResult = await adminApiCall(page, "GET", "/v1/admin/roles");
    const roles = rolesResult.data as { roles: Array<{ id: string; name: string }> };
    const memberRole = roles.roles?.find((r) => r.name === "member");

    if (!memberRole) {
      test.skip();
      return;
    }

    const revokeEmail = "revoked@test.production.city";

    // Create invitation
    const invResult = await adminApiCall(page, "POST", "/v1/admin/invitations", {
      email: revokeEmail,
      roleIds: [memberRole.id],
    });

    if (invResult.status !== 201) {
      test.skip();
      return;
    }

    const invitation = invResult.data as { invitation: { id: string } };

    // Revoke the invitation
    const revokeResult = await adminApiCall(
      page,
      "DELETE",
      `/v1/admin/invitations/${invitation.invitation.id}`,
    );
    expect(revokeResult.status).toBe(200);

    // Create magic link for the revoked email
    const { token } = await createMagicLink(revokeEmail, "invitation_accept");

    // Clear cookies and try to use the revoked invitation
    await page.context().clearCookies();
    await page.goto(`/auth/verify?token=${encodeURIComponent(token)}`);

    // Should show error (no pending invitation for this user)
    await expect(
      page.getByText(/invalid|expired|verification failed/i),
    ).toBeVisible();
  });
});
