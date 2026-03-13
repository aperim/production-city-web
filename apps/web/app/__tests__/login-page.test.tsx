import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

// Mock modules before importing
vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("../lib/api-client", () => ({
  requestMagicLink: vi.fn(),
  verifyCode: vi.fn(),
}));

vi.mock("../lib/use-delivery-polling", () => ({
  useDeliveryPolling: vi.fn().mockReturnValue({
    status: null,
    timedOut: false,
    sendingTooLong: false,
  }),
}));

import { useAuth } from "../lib/auth-context";
import LoginPage from "../login/page";

const mockUseAuth = vi.mocked(useAuth);

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form when not authenticated", () => {
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

    const html = renderToString(createElement(LoginPage));
    expect(html).toContain("Login");
    expect(html).toContain("Email");
  });

  it("shows loading state when auth is loading", () => {
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

    const html = renderToString(createElement(LoginPage));
    expect(html).toContain("Loading...");
  });

  it("does not render form when authenticated (redirects)", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "a@b.com", name: "Test", status: "active" },
      roles: [],
      permissions: [],
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      refreshSession: vi.fn(),
      hasPermission: () => false,
    });

    const html = renderToString(createElement(LoginPage));
    // Should not contain the login form when authenticated
    expect(html).not.toContain('aria-label="Login"');
  });
});
