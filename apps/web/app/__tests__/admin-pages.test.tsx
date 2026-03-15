import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../lib/api-client", () => ({
  listUsers: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { users: [], total: 0, page: 1, pageSize: 20 }, status: 200 }),
  ),
  getUser: vi.fn(),
  getUserAuditLog: vi.fn(),
  listInvitations: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { invitations: [], total: 0 }, status: 200 }),
  ),
  createInvitation: vi.fn(),
  resendInvitation: vi.fn(),
  revokeInvitation: vi.fn(),
  listSuppressions: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { suppressions: [] }, status: 200 }),
  ),
  removeSuppression: vi.fn(),
  listPendingApprovals: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { approvals: [] }, status: 200 }),
  ),
  approveUser: vi.fn(),
  rejectUser: vi.fn(),
  listAuditLog: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { entries: [], cursor: null }, status: 200 }),
  ),
  getSession: vi.fn().mockReturnValue(
    Promise.resolve({ ok: false, error: { error: "unauthorized", message: "Not authenticated" }, status: 401 }),
  ),
  logout: vi.fn(),
  listNotifications: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { notifications: [], unreadCount: 0 }, status: 200 }),
  ),
  markNotificationRead: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { message: "ok" }, status: 200 }),
  ),
  markAllNotificationsRead: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { message: "ok", count: 0 }, status: 200 }),
  ),
  listEoi: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } }, status: 200 }),
  ),
  getEoi: vi.fn(),
  updateEoiStatus: vi.fn(),
  getEoiStats: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { byCategory: {}, byStatus: {}, byLocale: {}, total: 0 }, status: 200 }),
  ),
}));

import { useAuth } from "../lib/auth-context";

const mockUseAuth = vi.mocked(useAuth);

function mockAdmin() {
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

function mockLimitedUser() {
  mockUseAuth.mockReturnValue({
    user: { id: "2", email: "user@test.com", name: "User", status: "active" },
    roles: ["member"],
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    refreshSession: vi.fn(),
    hasPermission: () => false,
  });
}

describe("UsersPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with permission", async () => {
    mockAdmin();
    const { default: UsersPage } = await import("../dashboard/users/page");
    const html = renderToString(createElement(UsersPage));
    expect(html).toContain("Users");
  });

  it("shows access denied without permission", async () => {
    mockLimitedUser();
    const { default: UsersPage } = await import("../dashboard/users/page");
    const html = renderToString(createElement(UsersPage));
    expect(html).toContain("Access Denied");
  });
});

describe("InvitationsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with permission", async () => {
    mockAdmin();
    const { default: InvitationsPage } = await import("../dashboard/invitations/page");
    const html = renderToString(createElement(InvitationsPage));
    expect(html).toContain("Invitations");
    expect(html).toContain("Suppressed Emails");
  });

  it("shows access denied without permission", async () => {
    mockLimitedUser();
    const { default: InvitationsPage } = await import("../dashboard/invitations/page");
    const html = renderToString(createElement(InvitationsPage));
    expect(html).toContain("Access Denied");
  });
});

describe("ApprovalsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with permission", async () => {
    mockAdmin();
    const { default: ApprovalsPage } = await import("../dashboard/approvals/page");
    const html = renderToString(createElement(ApprovalsPage));
    // Should contain the approvals layout
    expect(html).toContain("Pending Approvals");
  });

  it("shows access denied without permission", async () => {
    mockLimitedUser();
    const { default: ApprovalsPage } = await import("../dashboard/approvals/page");
    const html = renderToString(createElement(ApprovalsPage));
    expect(html).toContain("Access Denied");
  });
});

describe("AuditLogPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with permission", async () => {
    mockAdmin();
    const { default: AuditLogPage } = await import("../dashboard/audit-log/page");
    const html = renderToString(createElement(AuditLogPage));
    expect(html).toContain("Audit Log");
    expect(html).toContain("Filter by action");
    expect(html).toContain("Filter by actor");
  });

  it("shows access denied without permission", async () => {
    mockLimitedUser();
    const { default: AuditLogPage } = await import("../dashboard/audit-log/page");
    const html = renderToString(createElement(AuditLogPage));
    expect(html).toContain("Access Denied");
  });
});

describe("EoiPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with permission", async () => {
    mockAdmin();
    const { default: EoiPage } = await import("../dashboard/eoi/page");
    const html = renderToString(createElement(EoiPage));
    expect(html).toContain("Expressions of Interest");
  });

  it("shows access denied without permission", async () => {
    mockLimitedUser();
    const { default: EoiPage } = await import("../dashboard/eoi/page");
    const html = renderToString(createElement(EoiPage));
    expect(html).toContain("Access Denied");
  });
});

describe("Admin sidebar permission visibility", () => {
  it("shows all nav items for admin", async () => {
    mockAdmin();
    const { AdminLayout } = await import("../dashboard/admin-layout");
    const html = renderToString(
      createElement(AdminLayout, null, createElement("p", null, "content")),
    );
    expect(html).toContain("Dashboard");
    expect(html).toContain("Users");
    expect(html).toContain("Invitations");
    expect(html).toContain("Pending Approvals");
    expect(html).toContain("Expressions of Interest");
    expect(html).toContain("Audit Log");
  });

  it("hides nav items when user lacks permissions", async () => {
    mockLimitedUser();
    const { AdminLayout } = await import("../dashboard/admin-layout");
    const html = renderToString(
      createElement(AdminLayout, null, createElement("p", null, "content")),
    );
    expect(html).toContain("Dashboard"); // Always visible
    expect(html).not.toContain("Users");
    expect(html).not.toContain("Invitations");
    expect(html).not.toContain("Audit Log");
  });
});
