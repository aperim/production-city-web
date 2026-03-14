/**
 * Security-focused tests for auth pages.
 * Verifies: no raw HTML injection, no token storage, referrer policy, etc.
 */

import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

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
    "dashboard/admin-layout.tsx",
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
  it("has Referrer-Policy: no-referrer meta tag", async () => {
    const { default: VerifyPage } = await import("../auth/verify/page");
    const html = renderToString(createElement(VerifyPage));
    expect(html).toContain('name="referrer"');
    expect(html).toContain('content="no-referrer"');
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
