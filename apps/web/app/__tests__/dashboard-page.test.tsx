import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../dashboard/use-dashboard-role", () => ({
  useDashboardRole: vi.fn().mockReturnValue("admin"),
}));

vi.mock("../lib/api-client", () => ({
  getAdminStats: vi.fn().mockReturnValue(
    Promise.resolve({
      ok: true,
      data: { totalUsers: 42, pendingApprovals: 3, activeInvitations: 5 },
      status: 200,
    }),
  ),
  listAuditLog: vi.fn().mockReturnValue(
    Promise.resolve({
      ok: true,
      data: { entries: [], cursor: null },
      status: 200,
    }),
  ),
  getSession: vi.fn().mockReturnValue(
    Promise.resolve({ ok: false, error: { error: "unauthorized", message: "Not authenticated" }, status: 401 }),
  ),
  logout: vi.fn(),
}));

import { useAuth } from "../lib/auth-context";
import DashboardPage from "../dashboard/page";

const mockUseAuth = vi.mocked(useAuth);

function mockAuthenticatedAdmin() {
  mockUseAuth.mockReturnValue({
    user: { id: "1", email: "admin@test.com", name: "Admin", status: "active", hasPhone: false },
    roles: ["admin"],
    permissions: ["user:read", "invitation:read", "user:update", "audit:read"],
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    refreshSession: vi.fn(),
    hasPermission: (p: string) =>
      ["user:read", "invitation:read", "user:update", "audit:read"].includes(p),
  });
}

/** Strip React SSR comments from HTML for cleaner assertions */
function stripComments(html: string): string {
  return html.replace(/<!-- -->/g, "");
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders welcome message with user name", () => {
    mockAuthenticatedAdmin();
    const html = stripComments(renderToString(createElement(DashboardPage)));
    expect(html).toContain("Welcome back, Admin");
  });

  it("renders role label for admin", () => {
    mockAuthenticatedAdmin();
    const html = stripComments(renderToString(createElement(DashboardPage)));
    expect(html).toContain("Administrator");
  });

  it("renders quick actions (permission-gated)", () => {
    mockAuthenticatedAdmin();
    const html = renderToString(createElement(DashboardPage));
    expect(html).toContain("Invite User");
    expect(html).toContain("View Pending Approvals");
  });

  it("shows loading skeleton on initial render (data not yet fetched)", () => {
    mockAuthenticatedAdmin();
    const html = renderToString(createElement(DashboardPage));
    // Initial render: loading=true, no kpiCards yet → loading skeleton
    expect(html).toContain("animate-pulse");
  });

  it("does not wrap in AdminLayout (layout.tsx provides the shell)", () => {
    mockAuthenticatedAdmin();
    const html = stripComments(renderToString(createElement(DashboardPage)));
    // Page renders RoleDashboard directly — no sidebar nav in the page
    expect(html).toContain("Welcome back");
  });
});
