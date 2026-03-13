import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

vi.mock("../../lib/api-client", () => ({
  verifyToken: vi.fn(),
}));

import VerifyPage from "../auth/verify/page";

describe("VerifyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    const html = renderToString(createElement(VerifyPage));
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
