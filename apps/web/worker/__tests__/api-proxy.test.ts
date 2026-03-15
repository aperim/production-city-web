/**
 * Unit tests for the API proxy logic in the web Worker.
 *
 * The web worker proxies /v1/* requests to the backend worker via
 * a Cloudflare Service Binding (production/staging) or BACKEND_URL
 * fetch (dev). This ensures cookies with __Host- prefix (same-origin only)
 * work correctly without cross-origin issues.
 *
 * @see Issue #309
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isApiPath,
  proxyApiRequest,
} from "../api-proxy.js";

describe("isApiPath", () => {
  it("matches /v1/ prefixed paths", () => {
    expect(isApiPath("/v1/auth/session")).toBe(true);
    expect(isApiPath("/v1/announcements")).toBe(true);
    expect(isApiPath("/v1/admin/users")).toBe(true);
    expect(isApiPath("/v1/eoi")).toBe(true);
  });

  it("matches /live and /ready health probes", () => {
    expect(isApiPath("/live")).toBe(true);
    expect(isApiPath("/ready")).toBe(true);
  });

  it("does not match non-API paths", () => {
    expect(isApiPath("/")).toBe(false);
    expect(isApiPath("/login")).toBe(false);
    expect(isApiPath("/dashboard")).toBe(false);
    expect(isApiPath("/about")).toBe(false);
    expect(isApiPath("/v2/something")).toBe(false);
  });

  it("rejects paths with encoded traversal characters", () => {
    // Encoded forward slash
    expect(isApiPath("/v1/%2f..%2fadmin")).toBe(false);
    expect(isApiPath("/v1/%2F..%2Fadmin")).toBe(false);
    // Encoded dot segments
    expect(isApiPath("/v1/%2e%2e%2fadmin")).toBe(false);
    expect(isApiPath("/v1/%2E%2E/admin")).toBe(false);
    // Encoded backslash
    expect(isApiPath("/v1/%5c..%5cadmin")).toBe(false);
    expect(isApiPath("/v1/%5C..%5Cadmin")).toBe(false);
  });

  it("allows normal encoded characters in API paths", () => {
    // Normal URL-encoded characters that are not traversal-related
    expect(isApiPath("/v1/admin/users?search=hello%20world")).toBe(true);
    expect(isApiPath("/v1/admin/users/abc%3D123")).toBe(true);
  });
});

describe("proxyApiRequest — service binding", () => {
  const mockServiceFetch = vi.fn<(req: Request) => Promise<Response>>();

  beforeEach(() => {
    mockServiceFetch.mockReset();
  });

  it("forwards request to service binding when available", async () => {
    const backendResponse = new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    mockServiceFetch.mockResolvedValue(backendResponse);

    const request = new Request("https://production.city/v1/auth/session", {
      method: "GET",
      headers: { Cookie: "__Host-session=abc123" },
    });

    const response = await proxyApiRequest(request, {
      BACKEND_SERVICE: { fetch: mockServiceFetch },
    });

    expect(mockServiceFetch).toHaveBeenCalledTimes(1);
    const call = mockServiceFetch.mock.calls[0];
    expect(call).toBeDefined();
    const proxiedRequest = call![0] as Request;
    expect(proxiedRequest.url).toBe("https://production.city/v1/auth/session");
    expect(proxiedRequest.headers.get("Cookie")).toBe("__Host-session=abc123");
    expect(response.status).toBe(200);
  });

  it("preserves request method and body", async () => {
    mockServiceFetch.mockResolvedValue(
      new Response(JSON.stringify({ message: "created" }), { status: 201 }),
    );

    const request = new Request("https://production.city/v1/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    await proxyApiRequest(request, {
      BACKEND_SERVICE: { fetch: mockServiceFetch },
    });

    const call = mockServiceFetch.mock.calls[0];
    expect(call).toBeDefined();
    const proxiedRequest = call![0] as Request;
    expect(proxiedRequest.method).toBe("POST");
    const body = await proxiedRequest.text();
    expect(JSON.parse(body)).toEqual({ email: "test@example.com" });
  });

  it("forwards Set-Cookie headers from backend response", async () => {
    const backendResponse = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "__Host-session=newtoken; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400",
      },
    });
    mockServiceFetch.mockResolvedValue(backendResponse);

    const request = new Request("https://production.city/v1/auth/verify", {
      method: "POST",
    });

    const response = await proxyApiRequest(request, {
      BACKEND_SERVICE: { fetch: mockServiceFetch },
    });

    expect(response.headers.get("Set-Cookie")).toContain("__Host-session=newtoken");
  });

  it("returns 502 when service binding throws", async () => {
    mockServiceFetch.mockRejectedValue(new Error("Service binding unavailable"));

    const request = new Request("https://production.city/v1/auth/session");

    const response = await proxyApiRequest(request, {
      BACKEND_SERVICE: { fetch: mockServiceFetch },
    });

    expect(response.status).toBe(502);
    const body = await response.json() as { error: string };
    expect(body.error).toBe("backend_unavailable");
  });
});

describe("proxyApiRequest — BACKEND_URL fallback (dev)", () => {
  const originalFetch = globalThis.fetch;
  const mockFetch = vi.fn<(input: Request) => Promise<Response>>();

  beforeEach(() => {
    mockFetch.mockReset();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vi.fn mock assigned to globalThis.fetch for testing
    globalThis.fetch = mockFetch as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("falls back to BACKEND_URL when no service binding is available", async () => {
    const backendResponse = new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
    });
    mockFetch.mockResolvedValue(backendResponse);

    const request = new Request("http://localhost:4321/v1/auth/session", {
      method: "GET",
      headers: { Cookie: "__Host-session=abc123" },
    });

    const response = await proxyApiRequest(request, {
      BACKEND_URL: "http://localhost:8787",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    const proxiedRequest = call![0] as Request;
    // URL should be rewritten to backend URL
    expect(proxiedRequest.url).toBe("http://localhost:8787/v1/auth/session");
    expect(response.status).toBe(200);
  });

  it("preserves Cookie header when rewriting URL", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ user: {} }), { status: 200 }),
    );

    const request = new Request("http://localhost:4321/v1/auth/session", {
      headers: { Cookie: "__Host-session=abc123; other=value" },
    });

    await proxyApiRequest(request, {
      BACKEND_URL: "http://localhost:8787",
    });

    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    const proxiedRequest = call![0] as Request;
    expect(proxiedRequest.headers.get("Cookie")).toBe("__Host-session=abc123; other=value");
  });

  it("preserves query parameters when rewriting URL", async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ users: [] }), { status: 200 }),
    );

    const request = new Request(
      "http://localhost:4321/v1/admin/users?page=2&search=john",
    );

    await proxyApiRequest(request, {
      BACKEND_URL: "http://localhost:8787",
    });

    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    const proxiedRequest = call![0] as Request;
    expect(proxiedRequest.url).toBe(
      "http://localhost:8787/v1/admin/users?page=2&search=john",
    );
  });

  it("returns 502 when fetch rejects (backend down)", async () => {
    mockFetch.mockRejectedValue(new Error("Connection refused"));

    const request = new Request("http://localhost:4321/v1/auth/session");

    const response = await proxyApiRequest(request, {
      BACKEND_URL: "http://localhost:8787",
    });

    expect(response.status).toBe(502);
    const body = await response.json() as { error: string };
    expect(body.error).toBe("backend_unavailable");
  });

  it("returns 502 when neither service binding nor BACKEND_URL is configured", async () => {
    const request = new Request("https://production.city/v1/auth/session");

    const response = await proxyApiRequest(request, {});

    expect(response.status).toBe(502);
    const body = await response.json() as { error: string };
    expect(body.error).toBe("backend_unavailable");
  });
});
