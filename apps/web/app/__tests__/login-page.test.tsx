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

vi.mock("../lib/websocket/useDeliveryStatus", () => ({
  useDeliveryStatus: vi.fn().mockReturnValue({
    status: null,
    isConnected: false,
    timedOut: false,
    sendingTooLong: false,
  }),
}));

vi.mock("../i18n/context", () => ({
  useTranslation: () => ({
    locale: "en",
    direction: "ltr",
    setLocale: vi.fn(),
    t: (key: string) => {
      const keys: Record<string, string> = {
        "auth.login.title": "Sign in",
        "auth.login.emailLabel": "Email address",
        "auth.login.submitButton": "Send magic link",
        "auth.login.genericError": "Something went wrong. Please try again.",
        "auth.login.rateLimitDefault": "Too many attempts. Please try again later.",
        "auth.login.codeHeading": "Check your email",
        "auth.login.codeDescription": "Enter the verification code we sent to your email.",
        "auth.login.resendCode": "Resend code",
        "auth.login.lockedMessage": "Too many failed attempts. Please request a new code.",
        "auth.login.wrongEmail": "Wrong email? Go back",
        "auth.login.timedOut": "Verification is taking longer than expected.",
        "auth.login.invalidCode": "Invalid code",
        "common.loading": "Loading...",
      };
      return keys[key] ?? key;
    },
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
    expect(html).toContain("Sign in");
    expect(html).toContain("Email address");
  });

  it("shows skeleton loading state with accessible status when auth is loading", () => {
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
    // Should render skeleton elements with role="status" and SR-only text
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain("Loading...");
  });

  it("does not render form when authenticated (redirects)", () => {
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

    const html = renderToString(createElement(LoginPage));
    // Should not contain the login form when authenticated
    expect(html).not.toContain('aria-label="Login"');
  });

  it("renders translated email label", () => {
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
    expect(html).toContain("Email address");
    expect(html).toContain("Send magic link");
  });
});
