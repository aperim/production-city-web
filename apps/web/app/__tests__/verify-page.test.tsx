import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("../lib/api-client", () => ({
  verifyToken: vi.fn(),
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
      };
      return keys[key] ?? key;
    },
  }),
}));

import VerifyPage from "../auth/verify/page";

describe("VerifyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders skeleton loading state initially with accessible status", () => {
    const html = renderToString(createElement(VerifyPage));
    // Skeleton placeholder with role="status" and SR-only text
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain("Verifying...");
  });

  it("includes no-referrer meta tag", () => {
    const html = renderToString(createElement(VerifyPage));
    expect(html).toContain('content="no-referrer"');
    expect(html).toContain('name="referrer"');
  });

  it("does not include third-party script references", () => {
    const html = renderToString(createElement(VerifyPage));
    // No external scripts, analytics, fonts
    expect(html).not.toContain("googleapis");
    expect(html).not.toContain("analytics");
    expect(html).not.toContain("gtag");
    expect(html).not.toContain("cdn.");
  });
});
