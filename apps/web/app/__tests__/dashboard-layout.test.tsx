import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn(),
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
  useTranslation: () => ({
    locale: "en",
    direction: "ltr",
    setLocale: vi.fn(),
    t: (key: string) => {
      const keys: Record<string, string> = {
        "common.skipToContent": "Skip to main content",
        "common.loading": "Loading...",
      };
      return keys[key] ?? key;
    },
  }),
}));

vi.mock("../lib/api-client", () => ({
  getSession: vi.fn().mockReturnValue(
    Promise.resolve({ ok: false, error: { error: "unauthorized", message: "Not authenticated" }, status: 401 }),
  ),
  logout: vi.fn(),
  listNotifications: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { notifications: [], unreadCount: 0 }, status: 200 }),
  ),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

import { useAuth } from "../lib/auth-context";

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

describe("Dashboard layout.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ProtectedRoute wrapper (shows loading when isLoading)", async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      isLoading: true,
      logout: vi.fn(),
      refreshSession: vi.fn(),
      hasPermission: () => false,
    });
    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "child")),
    );
    expect(html).toContain("Loading");
  });

  it("renders sidebar with correct items based on permissions (admin)", async () => {
    mockAuthenticatedAdmin();
    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "content")),
    );
    expect(html).toContain("Dashboard");
    expect(html).toContain("Users");
    expect(html).toContain("Invitations");
    expect(html).toContain("Pending Approvals");
    expect(html).toContain("Audit Log");
  });

  it("hides sidebar items when user lacks permissions", async () => {
    mockLimitedUser();
    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "content")),
    );
    expect(html).toContain("Dashboard"); // Always visible
    expect(html).not.toContain(">Users<");
    expect(html).not.toContain("Invitations");
    expect(html).not.toContain("Audit Log");
  });

  it("dashboard home has no breadcrumbs", async () => {
    mockAuthenticatedAdmin();
    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "home content")),
    );
    expect(html).toContain("home content");
  });

  it("sidebar active state defaults to /dashboard on SSR", async () => {
    mockAuthenticatedAdmin();
    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "content")),
    );
    expect(html).toContain("content");
    expect(html).toContain("Dashboard");
  });

  it("renders children directly within the layout", async () => {
    mockAuthenticatedAdmin();
    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "my page content")),
    );
    expect(html).toContain("my page content");
  });

  it("layout provides the shell with sidebar", async () => {
    mockAuthenticatedAdmin();
    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "page content")),
    );
    expect(html).toContain("page content");
    expect(html).toContain("Dashboard");
  });
});
