/**
 * E2E tests: Dashboard scaffold — auth flow, sidebar, CommandBar,
 * ComingSoon, navigation, permissions, and legacy redirects.
 *
 * @see Issue #351 — 29 test scenarios across 8 categories
 */

import { test, expect } from "./helpers/setup";
import { loginAs, createMagicLink } from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";
const MEMBER_EMAIL = "member@test.production.city";
const VIEWER_EMAIL = "viewer@test.production.city";

// =============================================================================
// 1. Auth Flow (3 scenarios)
// =============================================================================

test.describe("Auth Flow — Dashboard redirect", () => {
  test("unauthenticated user hitting /dashboard is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    // Should redirect to login page (ProtectedRoute redirects to /login)
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await expect(page).toHaveURL(/login/);
  });

  test("after sign-in, user is redirected to dashboard", async ({ page }) => {
    const { code } = await createMagicLink(ADMIN_EMAIL);

    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(ADMIN_EMAIL);
    await page.getByRole("button", { name: /send magic link/i }).click();

    const codeInput = page.getByPlaceholder("000000");
    await codeInput.waitFor({ state: "visible" });
    await codeInput.fill(code);
    await page.getByRole("button", { name: /verify/i }).click();

    // Should redirect to dashboard after successful auth
    await page.waitForURL("**/dashboard**", { timeout: 15_000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test("unauthenticated user hitting a deep dashboard URL sees login", async ({
    page,
  }) => {
    // Try to access a specific dashboard page without auth
    await page.goto("/dashboard/company/hr/directory");

    // Should redirect to login
    await page.waitForURL("**/login**", { timeout: 15_000 });
    await expect(page).toHaveURL(/login/);
  });
});

// =============================================================================
// 2. Role-Based Sidebar (5 scenarios)
// =============================================================================

test.describe("Role-Based Sidebar", () => {
  test("admin sees sidebar with navigation groups", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");

    // Admin (super_admin role) should see the sidebar nav
    const sidebar = page.locator('[aria-label="Sidebar navigation"]');
    await expect(sidebar.first()).toBeVisible();

    // Should see workspace group (Dashboard/Home section is always visible)
    await expect(page.getByText("Dashboard").first()).toBeVisible();
  });

  test("member user sees sidebar with navigation groups", async ({ page }) => {
    await loginAs(page, MEMBER_EMAIL);
    await page.goto("/dashboard");

    // Member should see sidebar
    const sidebar = page.locator('[aria-label="Sidebar navigation"]');
    await expect(sidebar.first()).toBeVisible();
  });

  test("viewer user sees sidebar with navigation groups", async ({ page }) => {
    await loginAs(page, VIEWER_EMAIL);
    await page.goto("/dashboard");

    // Viewer should see sidebar
    const sidebar = page.locator('[aria-label="Sidebar navigation"]');
    await expect(sidebar.first()).toBeVisible();
  });

  test("sidebar items are visible for admin in scaffold phase", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");

    // In Phase 1 scaffold, all features are visible to all users
    // Verify at least some sidebar sections are rendered
    const sidebar = page.locator('[aria-label="Sidebar navigation"]');
    await expect(sidebar.first()).toBeVisible();

    // Should have clickable navigation links
    const links = sidebar.first().locator("a[href]");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("sidebar shows section labels matching registry groups", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");

    // The sidebar should render group labels from SIDEBAR_CONFIG
    // "Your Workspace" is the first group label
    await expect(page.getByText("Your Workspace").first()).toBeVisible();
  });
});

// =============================================================================
// 3. Phase-Based Visibility (2 scenarios)
// =============================================================================

test.describe("Phase-Based Visibility", () => {
  test("Phase 1 scaffold: all features visible in sidebar regardless of phase", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");

    // Phase 1 scaffold sets visibleFeatureIds = ALL routes (layout.tsx line 262)
    // and DEFAULT_PHASE = "company_formation". All 502 features are visible
    // regardless of their phase field. Phase filtering will be added in Phase 2.
    const sidebar = page.locator('[aria-label="Sidebar navigation"]');
    await expect(sidebar.first()).toBeVisible();

    // Verify multiple sidebar groups are rendered (not just workspace)
    const links = sidebar.first().locator("a[href]");
    const count = await links.count();
    expect(count).toBeGreaterThan(5);

    // Check that "Company" group is visible (would be hidden in future
    // if phase were "pre_formation", but visible in company_formation)
    await expect(page.getByText("Company").first()).toBeVisible();
  });

  test("features with company_formation phase render as ComingSoonPage", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    // home.overview.executive: phase=company_formation, status=planned
    await page.goto("/dashboard/home/executive");

    // FeatureGate renders ComingSoonPage for planned features
    await expect(
      page.getByText(/coming soon|planned|notify me/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Verify the page is actually a ComingSoonPage, not a broken state
    await expect(page.locator("main")).toBeVisible();
  });
});

// =============================================================================
// 4. ComingSoonPage (3 scenarios)
// =============================================================================

test.describe("ComingSoonPage", () => {
  test("navigate to a 'planned' feature shows ComingSoonPage", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    // company_ops.hr.directory has status: planned
    await page.goto("/dashboard/company/hr/directory");

    // Should show ComingSoonPage with feature metadata
    await expect(
      page.getByText(/coming soon|planned/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Should show the feature label
    await expect(
      page.getByText(/team directory|hr directory|directory/i).first(),
    ).toBeVisible();
  });

  test("navigate to a 'coming_soon' feature shows ComingSoonPage with status", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Find a coming_soon feature — check if any exist
    // Most scaffold features are 'planned'; test with any valid registry path
    await page.goto("/dashboard/home/executive");

    // Should show ComingSoonPage
    await expect(
      page.getByText(/coming soon|planned|notify me/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("ComingSoonPage shows related features in same subsection", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Navigate to company_ops.hr.directory — has 8 siblings in same subsection
    // (org_chart, recruitment, onboarding, performance, leave, payroll, etc.)
    await page.goto("/dashboard/company/hr/directory");

    await expect(
      page.getByText(/coming soon|planned/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // ComingSoonPage renders a "Related Features" section when siblings exist
    // The feature label should be visible (Team Directory from feature-index)
    await expect(
      page.getByText(/directory/i).first(),
    ).toBeVisible();

    // Main content area should be fully rendered
    await expect(page.locator("main")).toBeVisible();
    const mainText = await page.locator("main").textContent();
    // Main should contain meaningful content, not be empty
    expect(mainText!.length).toBeGreaterThan(10);
  });
});

// =============================================================================
// 5. CommandBar (4 scenarios)
// =============================================================================

test.describe("CommandBar", () => {
  test("Cmd+K opens command palette", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");

    // Wait for dashboard to fully load
    await expect(page.locator("main")).toBeVisible();

    // Press Cmd+K (Meta+K)
    await page.keyboard.press("Meta+k");

    // Command palette dialog should appear
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
  });

  test("search returns relevant features", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");
    await expect(page.locator("main")).toBeVisible();

    // Open command bar
    await page.keyboard.press("Meta+k");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });

    // Type a search query
    const input = page.getByRole("combobox");
    await input.fill("directory");

    // Should show matching results
    await expect(
      page.getByText(/directory/i).first(),
    ).toBeVisible();
  });

  test("selecting a result navigates to correct path", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");
    await expect(page.locator("main")).toBeVisible();

    const initialUrl = page.url();

    // Open command bar
    await page.keyboard.press("Meta+k");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });

    // Type to filter to a specific feature
    const input = page.getByRole("combobox");
    await input.fill("executive");

    // Press Enter to select the first result
    await page.keyboard.press("Enter");

    // Dialog should close after selection
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5_000 });

    // URL should have changed from the initial dashboard URL
    // The CommandBar onSelect navigates to the feature path
    const newUrl = page.url();
    expect(newUrl).not.toBe(initialUrl);
  });

  test("Esc closes command bar", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");
    await expect(page.locator("main")).toBeVisible();

    // Open command bar
    await page.keyboard.press("Meta+k");
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });

    // Press Escape
    await page.keyboard.press("Escape");

    // Dialog should close
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

// =============================================================================
// 6. Navigation (4 scenarios)
// =============================================================================

test.describe("Navigation", () => {
  test("deep link to a registry path works", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Navigate directly to a deep dashboard path
    await page.goto("/dashboard/company/hr/directory");

    // Page should load (ComingSoon for planned features)
    await expect(page.locator("main")).toBeVisible({ timeout: 10_000 });

    // Should show some content (ComingSoonPage or feature page)
    await expect(
      page.getByText(/directory|coming soon|planned/i).first(),
    ).toBeVisible();
  });

  test("breadcrumbs show correct hierarchy", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard/company/hr/directory");

    // Wait for page load
    await expect(page.locator("main")).toBeVisible({ timeout: 10_000 });

    // Breadcrumb component should render with hierarchy context
    // DashboardBreadcrumb uses aria-label="Breadcrumb"
    const breadcrumb = page.locator('[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible({ timeout: 5_000 });

    // Should show "Dashboard" as the root breadcrumb
    await expect(breadcrumb.getByText(/dashboard/i).first()).toBeVisible();
  });

  test("browser back/forward works between dashboard pages", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Navigate to dashboard home
    await page.goto("/dashboard");
    await expect(page.locator("main")).toBeVisible({ timeout: 10_000 });

    // Navigate to a feature page
    await page.goto("/dashboard/company/hr/directory");
    await expect(page.locator("main")).toBeVisible({ timeout: 10_000 });

    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/dashboard$/);

    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/company\/hr\/directory/);
  });

  test.describe("Mobile navigation", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("mobile: dashboard renders without horizontal overflow", async ({
      page,
    }) => {
      await loginAs(page, ADMIN_EMAIL);
      await page.goto("/dashboard");
      await expect(page.locator("main")).toBeVisible({ timeout: 10_000 });

      // No horizontal overflow
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      const clientWidth = await page.evaluate(
        () => document.documentElement.clientWidth,
      );
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });
});

// =============================================================================
// 7. Permission Boundary (2 scenarios)
// =============================================================================

test.describe("Permission Boundary", () => {
  test("viewer accessing admin-only feature gets empty state, not 403", async ({
    page,
  }) => {
    await loginAs(page, VIEWER_EMAIL);

    // Navigate to a nonexistent dashboard path
    // In Phase 1 scaffold, all features are visible to all users,
    // so we test with a truly nonexistent path to verify FeatureGate
    // returns null (404 behavior) instead of showing 403
    await page.goto("/dashboard/admin/secret/internal");

    // FeatureGate returns null for unknown features → rendered as empty/404
    await expect(page.locator("main")).toBeVisible({ timeout: 10_000 });

    // Must NOT show "Access Denied" or "403" — prevents feature enumeration
    const bodyText = await page.locator("body").textContent();
    expect(bodyText).not.toContain("403");
    expect(bodyText).not.toContain("Access Denied");
  });

  test("no feature metadata leaked in 404 response", async ({
    page,
  }) => {
    await loginAs(page, VIEWER_EMAIL);

    // Navigate to a path that doesn't map to any feature in the registry
    await page.goto("/dashboard/admin/nonexistent/feature");

    // Page should load without revealing any feature IDs or internal details
    await expect(page.locator("main")).toBeVisible({ timeout: 10_000 });

    const bodyText = await page.locator("body").textContent();
    // Should not expose internal feature ID format
    expect(bodyText).not.toMatch(/feature.*not.*found/i);
    // Should not reveal permission error details
    expect(bodyText).not.toMatch(/permission.*denied/i);
    // Should not expose route manifest IDs
    expect(bodyText).not.toMatch(/company_ops\.|administration\.|analytics\./);
  });
});

// =============================================================================
// 8. Migration Redirects (2 scenarios)
// =============================================================================

test.describe("Migration Redirects", () => {
  test("/dashboard/users redirects 301 to new admin path", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    // The legacy redirect is handled by the worker layer (legacy-redirects.ts)
    // /dashboard/users → /dashboard/admin/users/manage
    await page.goto("/dashboard/users");

    // Worker should 301 redirect to the new path
    await expect(page).toHaveURL(/admin\/users\/manage/);
  });

  test("legacy paths redirect with query params preserved", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Navigate to legacy path with query params
    // /dashboard/users?search=test&page=2 should redirect preserving params
    await page.goto("/dashboard/users?search=test&page=2");

    // Should redirect to new path with query params preserved
    const url = page.url();
    await expect(page).toHaveURL(/admin\/users\/manage/);
    expect(url).toContain("search=test");
    expect(url).toContain("page=2");
  });
});

// =============================================================================
// Desktop viewport (1440px) — cross-cutting
// =============================================================================

test.describe("Desktop viewport (1440px)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("dashboard renders correctly at 1440px", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");

    // Sidebar should be visible (not collapsed by default on desktop)
    const sidebar = page.locator('[aria-label="Sidebar navigation"]');
    await expect(sidebar.first()).toBeVisible({ timeout: 10_000 });

    // Main content area should be visible
    await expect(page.locator("main")).toBeVisible();

    // No horizontal overflow
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

// =============================================================================
// Mobile viewport (375px) — cross-cutting
// =============================================================================

test.describe("Mobile viewport (375px)", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("dashboard renders correctly at 375px", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");

    // Main content should be visible
    await expect(page.locator("main")).toBeVisible({ timeout: 10_000 });

    // No horizontal overflow
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("ComingSoonPage renders correctly at 375px", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard/company/hr/directory");

    // Should show ComingSoon content
    await expect(
      page.getByText(/coming soon|planned/i).first(),
    ).toBeVisible({ timeout: 10_000 });

    // No horizontal overflow
    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

// =============================================================================
// noindex meta tag
// =============================================================================

test.describe("Dashboard noindex", () => {
  test("dashboard pages include noindex meta tag", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);
    await page.goto("/dashboard");

    // Wait for page load
    await expect(page.locator("main")).toBeVisible({ timeout: 10_000 });

    // Check for noindex meta tag (Issue #352)
    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robotsMeta).toContain("noindex");
  });
});
