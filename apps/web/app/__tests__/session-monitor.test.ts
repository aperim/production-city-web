import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

/**
 * Tests for session expiry overlay and monitor logic.
 * @see Issue #353
 */

// Test the SessionExpiredOverlay component directly
import { SessionExpiredOverlay } from "../dashboard/components/SessionExpiredOverlay";

describe("SessionExpiredOverlay", () => {
  it("renders session expired message", () => {
    const html = renderToString(
      createElement(SessionExpiredOverlay, {
        message: "Your session has expired.",
        returnUrl: "/dashboard/users",
      }),
    );
    expect(html).toContain("Session Expired");
    expect(html).toContain("Your session has expired.");
  });

  it("renders sign-in link with returnUrl", () => {
    const html = renderToString(
      createElement(SessionExpiredOverlay, {
        message: "Session expired",
        returnUrl: "/dashboard/admin/audit/logs",
      }),
    );
    expect(html).toContain("Sign In");
    expect(html).toContain(
      encodeURIComponent("/dashboard/admin/audit/logs"),
    );
  });

  it("uses alertdialog role for accessibility", () => {
    const html = renderToString(
      createElement(SessionExpiredOverlay, {
        message: "Test",
        returnUrl: "/dashboard",
      }),
    );
    expect(html).toContain('role="alertdialog"');
    expect(html).toContain('aria-modal="true"');
  });

  it("applies backdrop blur styling", () => {
    const html = renderToString(
      createElement(SessionExpiredOverlay, {
        message: "Test",
        returnUrl: "/dashboard",
      }),
    );
    expect(html).toContain("backdrop-blur");
    expect(html).toContain("fixed");
    expect(html).toContain("z-50");
  });
});

describe("API client 401 event", () => {
  it("api-client exports request functions (smoke test)", async () => {
    // Verify the api-client module is importable
    const mod = await import("../lib/api-client");
    expect(typeof mod.getSession).toBe("function");
    expect(typeof mod.getAdminStats).toBe("function");
  });
});
