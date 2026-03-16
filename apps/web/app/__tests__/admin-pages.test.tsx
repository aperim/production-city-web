import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../lib/websocket/WebSocketProvider", async () => {
  const { createContext } = await import("react");
  return {
    WebSocketProvider: ({ children }: { children: React.ReactNode }) => children,
    WebSocketContext: createContext({ state: "disconnected" }),
  };
});

vi.mock("../lib/websocket/useWebSocket", () => ({
  useWebSocket: () => ({ state: "disconnected" }),
}));

vi.mock("../lib/websocket/useChannel", () => ({
  useChannel: vi.fn(),
}));

vi.mock("../i18n/context", () => ({
  I18nProvider: ({ children }: { children: React.ReactNode }) => children,
  useTranslation: () => ({
    locale: "en",
    direction: "ltr",
    setLocale: vi.fn(),
    t: (key: string) => {
      const keys: Record<string, string> = {
        "common.skipToContent": "Skip to main content",
        "common.loading": "Loading...",
        "dashboard.skip_to_content": "Skip to main content",
        "nav.dashboard": "Dashboard",
        "nav.users": "Users",
        "nav.invitations": "Invitations",
        "nav.approvals": "Approvals",
        "nav.updates": "Updates",
        "nav.auditLog": "Audit Log",
        "admin.categories.title": "Categories",
        "admin.tags.title": "Tags",
        "admin.subscriptions.title": "Subscriptions",
        "admin.eoi.title": "Expressions of Interest",
        "auth.logout.button": "Sign out",
        "admin.dashboard.title": "Dashboard",
        "admin.profile.title": "Profile",
        "admin.profile.nameLabel": "Display name",
        "admin.profile.emailLabel": "Email",
        "admin.profile.rolesLabel": "Roles",
        "admin.profile.themeLabel": "Appearance",
        "admin.profile.themeLight": "Light",
        "admin.profile.themeDark": "Dark",
        "admin.profile.saveButton": "Save",
        "admin.profile.sessions.title": "Active sessions",
        "admin.profile.sessions.currentSession": "Current session",
        "admin.profile.sessions.revokeButton": "Revoke",
        "admin.profile.sessions.noOtherSessions": "No other active sessions",
        "admin.profile.sessions.lastActive": "Last active",
        "admin.profile.sessions.createdAt": "Created",
        "admin.profile.sessions.justNow": "Just now",
        "admin.profile.sessions.minutesAgo": "min ago",
        "admin.profile.sessions.hoursAgo": "hr ago",
        "admin.profile.sessions.daysAgo": "d ago",
        "admin.profile.sessions.onDevice": "on",
        "admin.profile.emptyNameError": "Name cannot be empty",
        "admin.profile.genericError": "An error occurred",
      };
      return keys[key] ?? key;
    },
  }),
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

function mockLimitedUser() {
  mockUseAuth.mockReturnValue({
    user: { id: "2", email: "user@test.com", name: "User", status: "active", hasPhone: false },
    roles: ["member"],
    permissions: [],
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    refreshSession: vi.fn(),
    hasPermission: () => false,
  });
}

/**
 * Helper: wrap page in BreadcrumbProvider (simulates what layout.tsx does).
 * Pages now render content-only and rely on the layout for the shell.
 */
async function renderPageWithProvider(pagePath: string) {
  const { BreadcrumbProvider } = await import("../dashboard/breadcrumb-context");
  const { default: Page } = await import(pagePath);
  return renderToString(
    createElement(BreadcrumbProvider, null, createElement(Page)),
  );
}

describe("UsersPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with permission", async () => {
    mockAdmin();
    const html = await renderPageWithProvider("../dashboard/users/page");
    // Page renders UserTable inside PermissionGate — check for table markup
    expect(html).toContain("flex flex-col gap-4");
  });

  it("shows access denied without permission", async () => {
    mockLimitedUser();
    const html = await renderPageWithProvider("../dashboard/users/page");
    expect(html).toContain("Access Denied");
  });
});

describe("InvitationsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with permission", async () => {
    mockAdmin();
    const html = await renderPageWithProvider("../dashboard/invitations/page");
    expect(html).toContain("Invitations");
    expect(html).toContain("Suppressed Emails");
  });

  it("shows access denied without permission", async () => {
    mockLimitedUser();
    const html = await renderPageWithProvider("../dashboard/invitations/page");
    expect(html).toContain("Access Denied");
  });
});

describe("ApprovalsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with permission", async () => {
    mockAdmin();
    const html = await renderPageWithProvider("../dashboard/approvals/page");
    // Page renders loading state for pending approvals
    expect(html).toContain("Loading");
  });

  it("shows access denied without permission", async () => {
    mockLimitedUser();
    const html = await renderPageWithProvider("../dashboard/approvals/page");
    expect(html).toContain("Access Denied");
  });
});

describe("AuditLogPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with permission", async () => {
    mockAdmin();
    const html = await renderPageWithProvider("../dashboard/audit-log/page");
    expect(html).toContain("Filter by action");
    expect(html).toContain("Filter by actor");
  });

  it("shows access denied without permission", async () => {
    mockLimitedUser();
    const html = await renderPageWithProvider("../dashboard/audit-log/page");
    expect(html).toContain("Access Denied");
  });
});

describe("EoiPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders with permission", async () => {
    mockAdmin();
    const html = await renderPageWithProvider("../dashboard/eoi/page");
    // Page renders EoiStats + EoiTable (breadcrumb "Expressions of Interest" is set via context for layout)
    expect(html).toContain("All categories");
  });

  it("shows access denied without permission", async () => {
    mockLimitedUser();
    const html = await renderPageWithProvider("../dashboard/eoi/page");
    expect(html).toContain("Access Denied");
  });
});

describe("Dashboard layout sidebar permission visibility", () => {
  it("renders registry-driven sidebar for admin", async () => {
    mockAdmin();

    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "content")),
    );
    expect(html).toContain("Dashboard");
    expect(html).toContain("content");
    // New layout uses SidebarNav with registry-driven groups
    expect(html).toContain("nav");
  });

  it("renders layout for user without admin permissions", async () => {
    mockLimitedUser();

    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "content")),
    );
    expect(html).toContain("Dashboard");
    expect(html).toContain("content");
  });
});
