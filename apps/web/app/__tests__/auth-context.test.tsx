import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { AuthProvider, useAuth } from "../lib/auth-context";

// Mock the api-client module
vi.mock("../lib/api-client", () => ({
  getSession: vi.fn(),
  logout: vi.fn(),
}));

import { getSession, logout } from "../lib/api-client";

const mockGetSession = vi.mocked(getSession);
const _mockLogout = vi.mocked(logout);

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children while loading", () => {
    mockGetSession.mockReturnValue(new Promise(() => {})); // never resolves
    const html = renderToString(
      createElement(AuthProvider, null, createElement("p", null, "Hello")),
    );
    expect(html).toContain("Hello");
  });

  it("provides initial loading state", () => {
    mockGetSession.mockReturnValue(new Promise(() => {}));
    let capturedValue: ReturnType<typeof useAuth> | null = null;
    function Consumer() {
      capturedValue = useAuth();
      return createElement("p", null, "test");
    }
    renderToString(
      createElement(AuthProvider, null, createElement(Consumer)),
    );
    expect(capturedValue).not.toBeNull();
    expect(capturedValue!.isLoading).toBe(true);
    expect(capturedValue!.isAuthenticated).toBe(false);
    expect(capturedValue!.user).toBeNull();
  });
});

describe("useAuth", () => {
  it("throws when used outside AuthProvider", () => {
    function BadConsumer() {
      useAuth();
      return createElement("p", null, "should fail");
    }
    expect(() => renderToString(createElement(BadConsumer))).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("hasPermission checks permissions array", () => {
    mockGetSession.mockReturnValue(new Promise(() => {}));
    let ctx: ReturnType<typeof useAuth> | null = null;
    function Consumer() {
      ctx = useAuth();
      return null;
    }
    renderToString(
      createElement(AuthProvider, null, createElement(Consumer)),
    );
    // In initial state, no permissions
    expect(ctx!.hasPermission("user:read")).toBe(false);
  });
});
