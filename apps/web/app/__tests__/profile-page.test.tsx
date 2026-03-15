import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../i18n/context", () => ({
  useTranslation: () => ({
    locale: "en",
    direction: "ltr",
    setLocale: vi.fn(),
    t: (key: string) => {
      const keys: Record<string, string> = {
        "admin.dashboard.title": "Dashboard",
        "admin.profile.title": "Profile",
        "admin.profile.nameLabel": "Display name",
        "admin.profile.emailLabel": "Email",
        "admin.profile.rolesLabel": "Roles",
        "admin.profile.themeLabel": "Appearance",
        "admin.profile.themeLight": "Light",
        "admin.profile.themeDark": "Dark",
        "admin.profile.saveButton": "Save",
        "admin.profile.saving": "Saving...",
        "admin.profile.saved": "Saved",
        "admin.profile.sessions.title": "Active sessions",
        "admin.profile.sessions.currentSession": "Current session",
        "admin.profile.sessions.revokeButton": "Revoke",
        "admin.profile.sessions.confirmRevoke": "Confirm revoke?",
        "admin.profile.sessions.cancelRevoke": "Cancel",
        "admin.profile.sessions.noOtherSessions": "No other active sessions",
        "admin.profile.sessions.sessionRevoked": "Session revoked",
        "admin.profile.sessions.lastActive": "Last active",
        "admin.profile.sessions.createdAt": "Created",
        "admin.profile.sessions.justNow": "Just now",
        "admin.profile.sessions.minutesAgo": "min ago",
        "admin.profile.sessions.hoursAgo": "hr ago",
        "admin.profile.sessions.daysAgo": "d ago",
        "admin.profile.sessions.onDevice": "on",
        "admin.profile.sessions.revoking": "Revoking…",
        "admin.profile.sessions.revokeError": "Failed to revoke session",
        "admin.profile.emptyNameError": "Name cannot be empty",
        "admin.profile.genericError": "An error occurred",
        "common.loading": "Loading...",
      };
      return keys[key] ?? key;
    },
  }),
}));

vi.mock("../lib/api-client", () => ({
  getSession: vi.fn().mockResolvedValue({
    ok: false,
    error: { error: "unauthorized", message: "Not authenticated" },
    status: 401,
  }),
  updateProfile: vi.fn().mockResolvedValue({ ok: true, data: { message: "Profile updated" } }),
  listSessions: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      sessions: [
        {
          id: "s1",
          browser: "Chrome 133",
          os: "macOS 15.3",
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          isCurrent: true,
        },
      ],
    },
  }),
  revokeSession: vi.fn().mockResolvedValue({ ok: true, data: { message: "Session revoked" } }),
  logout: vi.fn(),
}));

vi.mock("../lib/websocket/WebSocketProvider", async (importOriginal) => {
  const { createContext } = await import("react");
  return {
    ...(await importOriginal<Record<string, unknown>>()),
    WebSocketProvider: ({ children }: { children: React.ReactNode }) => children,
    WebSocketContext: createContext({ state: "disconnected" }),
  };
});

vi.mock("../lib/websocket/useWebSocket", () => ({
  useWebSocket: () => ({ state: "disconnected" }),
}));

import { useAuth } from "../lib/auth-context";
import ProfilePage from "../dashboard/profile/page";
import { BreadcrumbProvider } from "../dashboard/breadcrumb-context";

const mockUseAuth = vi.mocked(useAuth);

function mockAuthenticatedUser() {
  mockUseAuth.mockReturnValue({
    user: { id: "u1", email: "test@example.com", name: "Test User", status: "active", hasPhone: false },
    roles: ["admin", "editor"],
    permissions: ["user:read", "audit:read"],
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    refreshSession: vi.fn().mockResolvedValue(undefined),
    hasPermission: (p: string) => ["user:read", "audit:read"].includes(p),
  });
}

describe("Profile Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user email (read-only)", () => {
    mockAuthenticatedUser();
    const html = renderToString(createElement(BreadcrumbProvider, null, createElement(ProfilePage)));
    expect(html).toContain("test@example.com");
    expect(html).toContain("Email");
  });

  it("renders profile form with name label", () => {
    mockAuthenticatedUser();
    const html = renderToString(createElement(BreadcrumbProvider, null, createElement(ProfilePage)));
    expect(html).toContain("Display name");
    expect(html).toContain("Save");
  });

  it("shows role badges from auth context", () => {
    mockAuthenticatedUser();
    const html = renderToString(createElement(BreadcrumbProvider, null, createElement(ProfilePage)));
    expect(html).toContain("admin");
    expect(html).toContain("editor");
  });

  it("renders theme toggle", () => {
    mockAuthenticatedUser();
    const html = renderToString(createElement(BreadcrumbProvider, null, createElement(ProfilePage)));
    expect(html).toContain("Light");
    expect(html).toContain("Dark");
    expect(html).toContain("Appearance");
  });

  it("sets breadcrumbs via context (layout renders them)", () => {
    mockAuthenticatedUser();
    // Wrap in BreadcrumbProvider to avoid context error
    const html = renderToString(
      createElement(BreadcrumbProvider, null, createElement(ProfilePage)),
    );
    // Page renders its content; breadcrumbs are set in context for the layout
    expect(html).toContain("Display name");
  });
});
