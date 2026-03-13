import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  requestMagicLink,
  verifyToken,
  verifyCode,
  logout,
  getSession,
  getDeliveryStatus,
  listUsers,
  listAuditLog,
} from "../lib/api-client";

// Mock global fetch
const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: () => Promise.resolve(data),
  });
}

describe("requestMagicLink", () => {
  it("sends POST to /v1/auth/magic-link with email", async () => {
    mockFetch.mockReturnValue(
      jsonResponse({ requestId: "abc", status: "sending", message: "Check email" }),
    );

    const result = await requestMagicLink("test@example.com");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.requestId).toBe("abc");
    }

    expect(mockFetch).toHaveBeenCalledWith(
      "/v1/auth/magic-link",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "test@example.com" }),
      }),
    );
  });

  it("handles 429 rate limit response", async () => {
    mockFetch.mockReturnValue(
      jsonResponse(
        { error: "rate_limited", message: "Too many requests", retryAfter: 60 },
        429,
      ),
    );

    const result = await requestMagicLink("test@example.com");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(429);
      expect(result.error.message).toBe("Too many requests");
    }
  });
});

describe("verifyToken", () => {
  it("sends GET to /v1/auth/verify with token query param", async () => {
    mockFetch.mockReturnValue(
      jsonResponse({ redirectUrl: "/dashboard" }),
    );

    const result = await verifyToken("my-token");
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "/v1/auth/verify?token=my-token",
      expect.objectContaining({ method: "GET", credentials: "include" }),
    );
  });
});

describe("verifyCode", () => {
  it("sends POST to /v1/auth/verify with email and code", async () => {
    mockFetch.mockReturnValue(
      jsonResponse({ redirectUrl: "/dashboard" }),
    );

    const result = await verifyCode("test@example.com", "123456");
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "/v1/auth/verify",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", code: "123456" }),
      }),
    );
  });

  it("handles invalid code response with remaining attempts", async () => {
    mockFetch.mockReturnValue(
      jsonResponse(
        { error: "invalid", message: "Invalid code", remainingAttempts: 2 },
        400,
      ),
    );

    const result = await verifyCode("test@example.com", "000000");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.remainingAttempts).toBe(2);
    }
  });
});

describe("logout", () => {
  it("sends POST to /v1/auth/logout", async () => {
    mockFetch.mockReturnValue(jsonResponse({ message: "Logged out" }));

    const result = await logout();
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "/v1/auth/logout",
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });
});

describe("getSession", () => {
  it("sends GET to /v1/auth/session", async () => {
    mockFetch.mockReturnValue(
      jsonResponse({
        user: { id: "1", email: "a@b.com", name: "Test", status: "active" },
        roles: ["admin"],
        permissions: ["user:read"],
        session: { createdAt: "2026-01-01", expiresAt: "2026-01-02" },
      }),
    );

    const result = await getSession();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.user.email).toBe("a@b.com");
      expect(result.data.permissions).toContain("user:read");
    }
  });

  it("handles 401 response", async () => {
    mockFetch.mockReturnValue(
      jsonResponse({ error: "unauthorized", message: "Not authenticated" }, 401),
    );

    const result = await getSession();
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });
});

describe("getDeliveryStatus", () => {
  it("sends GET to /v1/auth/magic-link/:requestId/status", async () => {
    mockFetch.mockReturnValue(jsonResponse({ status: "delivered" }));

    const result = await getDeliveryStatus("req-123");
    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "/v1/auth/magic-link/req-123/status",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("listUsers", () => {
  it("includes query params", async () => {
    mockFetch.mockReturnValue(
      jsonResponse({ users: [], total: 0, page: 1, pageSize: 20 }),
    );

    await listUsers({ page: 2, search: "john", status: "active" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("page=2"),
      expect.anything(),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("search=john"),
      expect.anything(),
    );
  });
});

describe("listAuditLog", () => {
  it("includes filter params", async () => {
    mockFetch.mockReturnValue(
      jsonResponse({ entries: [], cursor: null }),
    );

    await listAuditLog({ action: "auth.login", from: "2026-01-01" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("action=auth.login"),
      expect.anything(),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("from=2026-01-01"),
      expect.anything(),
    );
  });
});
