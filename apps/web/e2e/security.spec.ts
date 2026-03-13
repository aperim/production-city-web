/**
 * E2E tests: Security scenarios — cookie attributes, CSRF, anti-enumeration,
 * self-demotion, session revocation, permission enforcement.
 */

import { test, expect } from "./helpers/setup";
import { loginAs, createMagicLink, adminApiCall } from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";
const MEMBER_EMAIL = "member@test.production.city";

test.describe("Security — Session Cookie Attributes", () => {
  test("session cookie has expected __Host- security attributes", async ({ page }) => {
    const { token } = await createMagicLink(ADMIN_EMAIL);

    // Intercept the verify response to check Set-Cookie header
    const responsePromise = page.waitForResponse((res) =>
      res.url().includes("/v1/auth/verify"),
    );

    await page.goto(`/auth/verify?token=${encodeURIComponent(token)}`);

    const response = await responsePromise;
    const setCookieHeader = response.headers()["set-cookie"] ?? "";

    // __Host- prefix requires: HttpOnly, Secure, SameSite=Lax, Path=/, NO Domain
    expect(setCookieHeader).toContain("__Host-session");
    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("Secure");
    expect(setCookieHeader).toContain("SameSite=Lax");
    expect(setCookieHeader).toContain("Path=/");
    expect(setCookieHeader).toContain("Max-Age=");

    // __Host- prefix must NOT have Domain attribute
    expect(setCookieHeader).not.toMatch(/Domain=/i);
  });
});

test.describe("Security — Referrer Policy on Verify Page", () => {
  test("verify page has no-referrer meta tag", async ({ page }) => {
    await page.goto("/auth/verify?token=test-token");

    // Check for meta referrer tag
    const metaTag = page.locator('meta[name="referrer"]');
    await expect(metaTag).toHaveAttribute("content", "no-referrer");
  });
});

test.describe("Security — Test Endpoint Runtime Guard", () => {
  test("test endpoints are accessible when NODE_ENV=test and TEST_ENABLED=true", async ({ page }) => {
    // In our test environment, test routes should be mounted and accessible.
    // This verifies the runtime guard ALLOWS requests when conditions are met.
    const response = await page.request.get(
      "http://localhost:8787/v1/test/last-magic-link?email=test@example.com",
    );

    // Should get a valid response (200 with data or 404 for "no magic link"),
    // not a route-not-found error (which would indicate the routes aren't mounted)
    const status = response.status();
    const body = await response.json();

    if (status === 404) {
      // 404 from our handler (magic link not found) vs 404 from route not found
      expect(body.error).toBe("not_found");
      expect(body.message).toContain("No active magic link");
    } else {
      expect(status).toBe(200);
    }
  });

  // NOTE: A complementary CI-only test should verify that production builds
  // do NOT contain test route paths by grepping the build artifacts:
  //   grep -r "v1/test" dist/ && exit 1 || echo "PASS: no test routes in build"
  // This is implemented in the CI pipeline, not in E2E tests, because
  // E2E tests run in test mode by definition.
});

test.describe("Security — Anti-Enumeration", () => {
  test("unregistered and registered emails show identical UX", async ({
    page,
    context,
  }) => {
    // Test with registered email first
    await page.goto("/login");
    await page
      .getByPlaceholder("you@example.com")
      .fill(ADMIN_EMAIL);
    await page.getByRole("button", { name: /send magic link/i }).click();

    // Should transition to code entry
    await expect(page.getByPlaceholder("000000")).toBeVisible({
      timeout: 10_000,
    });

    // Now test with unregistered email in a fresh page
    const page2 = await context.newPage();
    await page2.goto("/login");
    await page2
      .getByPlaceholder("you@example.com")
      .fill("doesnotexist@nowhere.example");
    await page2.getByRole("button", { name: /send magic link/i }).click();

    // Should also transition to code entry (identical UX)
    await expect(page2.getByPlaceholder("000000")).toBeVisible({
      timeout: 10_000,
    });

    await page2.close();
  });
});

test.describe("Security — CSRF Protection", () => {
  test("cross-origin POST to /v1/auth/logout is rejected (Origin mismatch)", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    const response = await page.request.post(
      "http://localhost:8787/v1/auth/logout",
      {
        headers: {
          Origin: "https://evil.example.com",
          "Content-Type": "application/json",
        },
      },
    );

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("csrf_failed");
    expect(body.message).toContain("Origin mismatch");
  });

  test("POST without Origin or Referer header is rejected", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Send POST without Origin header — CSRF middleware should reject
    // Note: Playwright's request API doesn't add Origin automatically
    const response = await page.request.post(
      "http://localhost:8787/v1/auth/logout",
      {
        headers: {
          "Content-Type": "application/json",
          // Explicitly omit Origin and Referer
        },
      },
    );

    // Should be rejected — missing Origin/Referer
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("csrf_failed");
  });
});

test.describe("Security — Self-Demotion Prevention", () => {
  test("admin cannot remove own super_admin role", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Get own user info
    const sessionResult = await adminApiCall(page, "GET", "/v1/auth/session");
    const session = sessionResult.data as {
      user: { id: string };
      roles: string[];
    };

    // Get super_admin role ID
    const rolesResult = await adminApiCall(page, "GET", "/v1/admin/roles");
    const roles = rolesResult.data as {
      roles: Array<{ id: string; name: string }>;
    };
    const superAdminRole = roles.roles?.find((r) => r.name === "super_admin");

    if (!superAdminRole) {
      test.skip();
      return;
    }

    // Try to remove own super_admin role
    const removeResult = await adminApiCall(
      page,
      "DELETE",
      `/v1/admin/users/${session.user.id}/roles/${superAdminRole.id}`,
    );

    expect(removeResult.status).toBe(409);
  });
});

test.describe("Security — Self-Deactivation Prevention", () => {
  test("admin cannot deactivate own account", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    const sessionResult = await adminApiCall(page, "GET", "/v1/auth/session");
    const session = sessionResult.data as { user: { id: string } };

    // Try to deactivate self
    const result = await adminApiCall(
      page,
      "PATCH",
      `/v1/admin/users/${session.user.id}`,
      { status: "deactivated" },
    );

    expect(result.status).toBe(409);
    const body = result.data as { error: string; message: string };
    expect(body.error).toBe("conflict");
  });
});

test.describe("Security — Session Revocation", () => {
  test("revoked session returns 401 and frontend detects it", async ({
    page,
    context,
  }) => {
    // Login as member
    await loginAs(page, MEMBER_EMAIL);

    // Verify we're on dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Now login as admin in a separate page and revoke member's sessions
    const adminPage = await context.newPage();
    await loginAs(adminPage, ADMIN_EMAIL);

    // Find member user
    const usersResult = await adminApiCall(
      adminPage,
      "GET",
      "/v1/admin/users?search=member",
    );
    const users = usersResult.data as {
      users: Array<{ id: string; email: string }>;
    };
    const memberUser = users.users?.find(
      (u) => u.email === MEMBER_EMAIL,
    );

    if (!memberUser) {
      test.skip();
      return;
    }

    // Deactivate member (which revokes all sessions)
    const deactivateResult = await adminApiCall(
      adminPage,
      "PATCH",
      `/v1/admin/users/${memberUser.id}`,
      { status: "deactivated" },
    );
    expect(deactivateResult.status).toBe(200);

    await adminPage.close();

    // Verify the member's session is now invalid via API
    const sessionCheck = await page.request.get("/v1/auth/session");
    expect(sessionCheck.status()).toBe(401);

    // Navigate as the revoked member — the frontend auth context should
    // detect the 401 and show login or session-expired state
    await page.goto("/dashboard");

    // The route guard or auth context should prevent dashboard access
    // and either redirect to login or show session expired message
    await expect(
      page.getByText(/sign in|session.*expired|loading/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Security — Permission Enforcement", () => {
  test("member cannot access admin API endpoints (403)", async ({ page }) => {
    await loginAs(page, MEMBER_EMAIL);

    // Try admin endpoints — should get 403 Forbidden
    const usersResult = await adminApiCall(page, "GET", "/v1/admin/users");
    expect(usersResult.status).toBe(403);

    const invitationsResult = await adminApiCall(
      page,
      "GET",
      "/v1/admin/invitations",
    );
    expect(invitationsResult.status).toBe(403);

    const approvalsResult = await adminApiCall(
      page,
      "GET",
      "/v1/admin/approvals",
    );
    expect(approvalsResult.status).toBe(403);

    const auditResult = await adminApiCall(
      page,
      "GET",
      "/v1/admin/audit-log",
    );
    expect(auditResult.status).toBe(403);
  });
});

test.describe("Security — Concurrent Magic Link Verification", () => {
  test("only one session is created from a single magic link token", async ({
    page,
    context,
  }) => {
    const { token } = await createMagicLink(ADMIN_EMAIL);
    const verifyUrl = `/auth/verify?token=${encodeURIComponent(token)}`;

    // First verification should succeed
    await page.goto(verifyUrl);
    await page.waitForURL("**/dashboard**");

    // Second verification with same token should fail
    const page2 = await context.newPage();
    await page2.goto(verifyUrl);

    // Should see an error (token already consumed)
    await expect(
      page2.getByText(/invalid|expired|verification failed/i),
    ).toBeVisible({ timeout: 10_000 });

    await page2.close();
  });
});
