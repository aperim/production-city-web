import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../lib/api-client", () => ({
  updateProfile: vi.fn(),
}));

import { useAuth } from "../lib/auth-context";
import OnboardingPage from "../onboarding/page";

const mockUseAuth = vi.mocked(useAuth);

describe("OnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders name input when authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", email: "a@b.com", name: null, status: "active" },
      roles: [],
      permissions: [],
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn(),
      refreshSession: vi.fn(),
      hasPermission: () => false,
    });

    const html = renderToString(createElement(OnboardingPage));
    expect(html).toContain("Welcome");
    expect(html).toContain("Name");
    expect(html).toContain("Continue");
  });

  it("shows loading when session is loading", () => {
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

    const html = renderToString(createElement(OnboardingPage));
    expect(html).toContain("Loading...");
  });

  it("does not render form when not authenticated", () => {
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

    const html = renderToString(createElement(OnboardingPage));
    expect(html).not.toContain("Name");
    expect(html).not.toContain("Continue");
  });
});
