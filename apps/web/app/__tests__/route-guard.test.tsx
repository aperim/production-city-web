import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { ProtectedRoute, PermissionGate, AccessDenied } from "../lib/route-guard";

// Mock auth context
vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../lib/auth-context";

const mockUseAuth = vi.mocked(useAuth);

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state when session is loading", () => {
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
    const html = renderToString(
      createElement(
        ProtectedRoute,
        null,
        createElement("p", null, "Protected"),
      ),
    );
    expect(html).toContain("Loading...");
    expect(html).not.toContain("Protected");
  });

  it("renders children when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "a@b.com", name: "Test", status: "active", hasPhone: false },
      roles: [],
      permissions: [],
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      refreshSession: vi.fn(),
      hasPermission: () => false,
    });
    const html = renderToString(
      createElement(
        ProtectedRoute,
        null,
        createElement("p", null, "Protected"),
      ),
    );
    expect(html).toContain("Protected");
  });

  it("does not render children when not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
      logout: vi.fn(),
      refreshSession: vi.fn(),
      hasPermission: () => false,
    });
    const html = renderToString(
      createElement(
        ProtectedRoute,
        null,
        createElement("p", null, "Protected"),
      ),
    );
    expect(html).not.toContain("Protected");
  });
});

describe("PermissionGate", () => {
  it("shows content when user has permission", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "a@b.com", name: "Test", status: "active", hasPhone: false },
      roles: ["admin"],
      permissions: ["user:read"],
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      refreshSession: vi.fn(),
      hasPermission: (p: string) => p === "user:read",
    });
    const html = renderToString(
      createElement(
        PermissionGate,
        { permission: "user:read" },
        createElement("p", null, "Admin Content"),
      ),
    );
    expect(html).toContain("Admin Content");
  });

  it("shows access denied when user lacks permission", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "a@b.com", name: "Test", status: "active", hasPhone: false },
      roles: ["member"],
      permissions: [],
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      refreshSession: vi.fn(),
      hasPermission: () => false,
    });
    const html = renderToString(
      createElement(
        PermissionGate,
        { permission: "user:read" },
        createElement("p", null, "Admin Content"),
      ),
    );
    expect(html).not.toContain("Admin Content");
    expect(html).toContain("Access Denied");
  });

  it("shows custom fallback when provided", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "a@b.com", name: "Test", status: "active", hasPhone: false },
      roles: [],
      permissions: [],
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      refreshSession: vi.fn(),
      hasPermission: () => false,
    });
    const html = renderToString(
      createElement(
        PermissionGate,
        {
          permission: "user:read",
          fallback: createElement("p", null, "Custom Denied"),
        },
        createElement("p", null, "Admin Content"),
      ),
    );
    expect(html).toContain("Custom Denied");
    expect(html).not.toContain("Admin Content");
  });
});

describe("AccessDenied", () => {
  it("renders access denied message", () => {
    const html = renderToString(createElement(AccessDenied));
    expect(html).toContain("Access Denied");
    expect(html).toContain("You do not have permission");
  });
});
