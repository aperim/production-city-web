import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../lib/api-client", () => ({
  updateProfile: vi.fn(),
}));

vi.mock("../i18n/context", () => ({
  useTranslation: () => ({
    locale: "en",
    direction: "ltr",
    setLocale: vi.fn(),
    t: (key: string) => {
      const keys: Record<string, string> = {
        "auth.onboarding.welcome": "Welcome",
        "auth.onboarding.whatToCall": "What should we call you?",
        "auth.onboarding.nameLabel": "Name",
        "auth.onboarding.continueButton": "Continue",
        "auth.onboarding.saving": "Saving...",
        "auth.onboarding.genericError": "Something went wrong",
        "common.loading": "Loading...",
      };
      return keys[key] ?? key;
    },
  }),
}));

import { useAuth } from "../lib/auth-context";
import OnboardingPage from "../onboarding/page";

const mockUseAuth = vi.mocked(useAuth);

describe("OnboardingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders translated form when authenticated", () => {
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
    expect(html).toContain("What should we call you?");
  });

  it("shows skeleton loading with accessible status when session is loading", () => {
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
    // Should render skeleton elements with role="status" and SR-only text
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="status"');
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
