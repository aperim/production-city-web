/**
 * Security-focused tests for auth pages.
 * Verifies: no raw HTML injection, no token storage, referrer policy, etc.
 */

import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
vi.mock("../lib/auth-context", () => ({
  useAuth: vi.fn().mockReturnValue({
    user: null,
    roles: [],
    permissions: [],
    isAuthenticated: false,
    isLoading: false,
    logout: vi.fn(),
    refreshSession: vi.fn(),
    hasPermission: () => false,
  }),
}));

vi.mock("../lib/api-client", () => ({
  verifyToken: vi.fn(),
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
        "auth.verify.verifying": "Verifying...",
        "auth.verify.verified": "Verified. Redirecting...",
        "auth.verify.noToken": "No verification token provided.",
        "auth.verify.failed": "Verification failed. Please try again.",
        "auth.verify.backToLogin": "Back to login",
        "auth.login.emailLabel": "Email address",
        "auth.login.submitButton": "Send magic link",
        "auth.login.submitting": "Sending...",
        "auth.login.genericError": "Something went wrong. Please try again.",
        "auth.login.rateLimitDefault": "Too many attempts.",
        "auth.login.codeHeading": "Check your email",
        "auth.login.codeDescription": "Enter the verification code.",
        "auth.login.resendCode": "Resend code",
        "auth.login.lockedMessage": "Too many failed attempts.",
        "auth.login.verifying": "Verifying...",
        "auth.login.wrongEmail": "Wrong email? Go back",
        "auth.login.timedOut": "Verification is taking longer than expected.",
        "auth.login.invalidCode": "Invalid code",
      };
      return keys[key] ?? key;
    },
  }),
}));

const APP_ROOT = resolve(import.meta.dirname, "..");

// The forbidden pattern that enables XSS via raw HTML injection
const FORBIDDEN_RAW_HTML = "dangerously" + "SetInnerHTML";

describe("Security: no raw HTML injection", () => {
  const pageFiles = [
    "login/page.tsx",
    "auth/verify/page.tsx",
    "onboarding/page.tsx",
    "dashboard/page.tsx",
    "dashboard/users/page.tsx",
    "dashboard/invitations/page.tsx",
    "dashboard/approvals/page.tsx",
    "dashboard/audit-log/page.tsx",
    "dashboard/layout.tsx",
    "dashboard/breadcrumb-context.tsx",
    "lib/auth-context.tsx",
    "lib/route-guard.tsx",
  ];

  for (const file of pageFiles) {
    it(`${file} does not use raw HTML injection`, () => {
      const content = readFileSync(resolve(APP_ROOT, file), "utf-8");
      expect(content).not.toContain(FORBIDDEN_RAW_HTML);
    });
  }
});

describe("Security: no token storage in JS", () => {
  const pageFiles = [
    "login/page.tsx",
    "auth/verify/page.tsx",
    "onboarding/page.tsx",
    "lib/auth-context.tsx",
    "lib/api-client.ts",
  ];

  for (const file of pageFiles) {
    it(`${file} does not store tokens in localStorage/sessionStorage`, () => {
      const content = readFileSync(resolve(APP_ROOT, file), "utf-8");
      expect(content).not.toContain("localStorage");
      expect(content).not.toContain("sessionStorage");
      expect(content).not.toContain("sessionToken");
    });
  }
});

describe("Security: verification page", () => {
  it("has Referrer-Policy: no-referrer meta tag", () => {
    // Read the source file to verify the meta tag is present in code
    const content = readFileSync(resolve(APP_ROOT, "auth/verify/page.tsx"), "utf-8");
    expect(content).toContain('name="referrer"');
    expect(content).toContain('content="no-referrer"');
  });

  it("verification page source has no third-party script imports", () => {
    const content = readFileSync(
      resolve(APP_ROOT, "auth/verify/page.tsx"),
      "utf-8",
    );
    // No external URLs
    expect(content).not.toMatch(/https?:\/\/(?!localhost)/);
    // No analytics
    expect(content).not.toContain("analytics");
    expect(content).not.toContain("gtag");
    // No external fonts
    expect(content).not.toContain("googleapis");
    expect(content).not.toContain("fonts.com");
  });
});

describe("Security: cookie-only auth", () => {
  it("api client uses credentials: include", () => {
    const content = readFileSync(
      resolve(APP_ROOT, "lib/api-client.ts"),
      "utf-8",
    );
    expect(content).toContain("credentials: 'include'");
  });

  it("api client does not set Authorization headers", () => {
    const content = readFileSync(
      resolve(APP_ROOT, "lib/api-client.ts"),
      "utf-8",
    );
    expect(content).not.toContain("Authorization");
    expect(content).not.toContain("Bearer");
  });
});

describe("Security: isSafeUrl pattern in layout", () => {
  it("layout.tsx contains isSafeUrl that rejects protocol-relative and absolute URLs", () => {
    const content = readFileSync(resolve(APP_ROOT, "dashboard/layout.tsx"), "utf-8");
    // Verify isSafeUrl exists and checks for "/" prefix and "//" rejection
    expect(content).toContain("function isSafeUrl");
    expect(content).toContain('url.startsWith("/")');
    expect(content).toContain('url.startsWith("//")');
  });

  it("layout.tsx gates notification navigation on isSafeUrl", () => {
    const content = readFileSync(resolve(APP_ROOT, "dashboard/layout.tsx"), "utf-8");
    // Count uses of window.location with actionUrl — each must have a nearby isSafeUrl guard
    const lines = content.split("\n");
    const navLines = lines
      .map((l, i) => ({ line: l, idx: i }))
      .filter(({ line }) => line.includes("actionUrl") && line.includes("window.location"));
    expect(navLines.length).toBeGreaterThan(0);
    for (const { idx } of navLines) {
      // Check the 5 preceding lines for an isSafeUrl guard
      const context = lines.slice(Math.max(0, idx - 5), idx + 1).join("\n");
      expect(context).toContain("isSafeUrl");
    }
  });
});

describe("Security: anti-enumeration", () => {
  it("login page does not distinguish between registered and unregistered emails", () => {
    const content = readFileSync(
      resolve(APP_ROOT, "login/page.tsx"),
      "utf-8",
    );
    // Should not contain any "not found", "not registered", or "no account" messages
    expect(content.toLowerCase()).not.toContain("not found");
    expect(content.toLowerCase()).not.toContain("not registered");
    expect(content.toLowerCase()).not.toContain("no account");
  });
});
