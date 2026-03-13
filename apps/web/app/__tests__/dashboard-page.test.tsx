import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn(),
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
    user: { id: "1", email: "admin@test.com", name: "Admin", status: "active" },
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

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders stats cards", () => {
    mockAuthenticatedAdmin();
    const html = renderToString(createElement(DashboardPage));
    expect(html).toContain("Total Users");
    expect(html).toContain("Pending Approvals");
    expect(html).toContain("Active Invitations");
  });

  it("renders quick actions", () => {
    mockAuthenticatedAdmin();
    const html = renderToString(createElement(DashboardPage));
    expect(html).toContain("Invite User");
    expect(html).toContain("View Pending Approvals");
  });

  it("renders recent activity section", () => {
    mockAuthenticatedAdmin();
    const html = renderToString(createElement(DashboardPage));
    expect(html).toContain("Recent Activity");
  });

  it("renders sidebar navigation links", () => {
    mockAuthenticatedAdmin();
    const html = renderToString(createElement(DashboardPage));
    expect(html).toContain("Dashboard");
    expect(html).toContain("Users");
    expect(html).toContain("Invitations");
    expect(html).toContain("Audit Log");
  });
});
