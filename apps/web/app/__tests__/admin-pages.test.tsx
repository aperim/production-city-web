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
        "auth.logout.button": "Sign out",
        "admin.dashboard.title": "Dashboard",
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
  markNotificationRead: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { message: "ok" }, status: 200 }),
  ),
  markAllNotificationsRead: vi.fn().mockReturnValue(
    Promise.resolve({ ok: true, data: { message: "ok", count: 0 }, status: 200 }),
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

describe("Dashboard layout sidebar permission visibility", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders workspace sidebar for admin", async () => {
    mockAdmin();

    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "content")),
    );
    // Phase 2: WorkspaceSidebar renders workspace items
    expect(html).toContain("Workspaces");
    expect(html).toContain("content");
    expect(html).toContain("nav");
  });

  it("renders layout for user without admin permissions", async () => {
    mockLimitedUser();

    const { default: DashboardLayout } = await import("../dashboard/layout");
    const html = renderToString(
      createElement(DashboardLayout, null, createElement("p", null, "content")),
    );
    expect(html).toContain("Workspaces");
    expect(html).toContain("content");
  });
});
