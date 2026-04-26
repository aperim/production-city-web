/**
 * Unit tests for the web Worker entry point.
 *
 * Tests the www.production.city → production.city 308 redirect (Issue #97)
 * without importing the full vinext handler, by testing the redirect logic
 * in isolation.
 *
 * 308 (Permanent Redirect) is used instead of 301 to preserve HTTP method
 * for non-GET requests (browsers treat both as permanent for GET/HEAD).
 *
 * @see Issue #97
 */

import { describe, it, expect } from "vitest";

const CANONICAL_HOST = "production.city";
const WWW_HOST = `www.${CANONICAL_HOST}`;

/**
 * Inline CSP builder mirroring worker/index.ts logic for isolated testing.
 * Keep in sync with buildCsp() in worker/index.ts (PRO-194).
 */
function buildCsp(hostname: string): string {
  const isDev = hostname === "localhost" || hostname === "127.0.0.1";
  if (isDev) {
    return `default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ws://localhost:* wss://localhost:*`;
  }
  const baseHost = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  const apiOrigin = `api.${baseHost}`;
  return `default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://${apiOrigin} wss://${apiOrigin}`;
}

/**
 * Inline implementation of the redirect logic to test it in isolation.
 * This mirrors what is implemented in worker/index.ts.
 *
 * We test the logic separately because the vinext handler
 * (imported from "vinext/server/app-router-entry") requires the full
 * Cloudflare Workers runtime and is not available in jsdom tests.
 */
function applyWwwRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.hostname === WWW_HOST) {
    url.protocol = "https:";
    url.hostname = CANONICAL_HOST;
    url.port = "";
    url.username = "";
    url.password = "";
    return Response.redirect(url.toString(), 308);
  }
  return null;
}

describe("Web Worker — www redirect (Issue #97)", () => {
  it("redirects www.production.city to production.city with 308", () => {
    const request = new Request("https://www.production.city/");
    const response = applyWwwRedirect(request);

    expect(response).not.toBeNull();
    expect(response!.status).toBe(308);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/",
    );
  });

  it("preserves path when redirecting from www", () => {
    const request = new Request(
      "https://www.production.city/some/deep/path?query=value",
    );
    const response = applyWwwRedirect(request);

    expect(response).not.toBeNull();
    expect(response!.status).toBe(308);
    expect(response!.headers.get("Location")).toBe(
      "https://production.city/some/deep/path?query=value",
    );
  });

  it("does not redirect canonical production.city requests", () => {
    const request = new Request("https://production.city/");
    const response = applyWwwRedirect(request);

    expect(response).toBeNull();
  });

  it("does not redirect api.production.city requests", () => {
    const request = new Request("https://api.production.city/live");
    const response = applyWwwRedirect(request);

    expect(response).toBeNull();
  });

  it("does not redirect localhost requests (dev environment)", () => {
    const request = new Request("http://localhost:4321/");
    const response = applyWwwRedirect(request);

    expect(response).toBeNull();
  });

  it("redirect is 308 (permanent redirect preserving method)", () => {
    const request = new Request("https://www.production.city/page");
    const response = applyWwwRedirect(request);

    expect(response!.status).toBe(308);
  });

  it("redirect target forces https scheme", () => {
    // Even if the incoming request somehow has http (e.g. from Cloudflare proxy),
    // the redirect must always go to https.
    const request = new Request("http://www.production.city/page");
    const response = applyWwwRedirect(request);

    expect(response!.headers.get("Location")).toMatch(/^https:\/\//);
  });
});

describe("CSP headers — WebSocket directives (#194)", () => {
  it("dev CSP allows ws:// and wss:// on localhost", () => {
    const csp = buildCsp("localhost");
    expect(csp).toContain("ws://localhost:*");
    expect(csp).toContain("wss://localhost:*");
    expect(csp).not.toContain("wss://api.production.city");
  });

  it("dev CSP allows ws:// on 127.0.0.1", () => {
    const csp = buildCsp("127.0.0.1");
    expect(csp).toContain("ws://localhost:*");
    expect(csp).toContain("wss://localhost:*");
  });

  it("production CSP allows https:// and wss:// for api.production.city", () => {
    const csp = buildCsp("production.city");
    expect(csp).toContain("https://api.production.city");
    expect(csp).toContain("wss://api.production.city");
    expect(csp).not.toContain("ws://localhost");
  });

  it("staging CSP allows https:// and wss:// for api.staging.production.city (PRO-194)", () => {
    const csp = buildCsp("staging.production.city");
    expect(csp).toContain("https://api.staging.production.city");
    expect(csp).toContain("wss://api.staging.production.city");
    expect(csp).not.toContain("api.production.city");
    expect(csp).not.toContain("ws://localhost");
  });

  it("www CSP strips www. prefix so connect-src targets api.production.city not api.www.production.city", () => {
    const csp = buildCsp("www.production.city");
    expect(csp).toContain("https://api.production.city");
    expect(csp).toContain("wss://api.production.city");
    expect(csp).not.toContain("api.www.production.city");
  });

  it("production CSP does not allow unencrypted ws://", () => {
    const csp = buildCsp("production.city");
    expect(csp).not.toMatch(/ws:\/\/(?!s)/);
  });

  it("CSP retains all default directives", () => {
    const csp = buildCsp("production.city");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).toContain("font-src 'self' https://fonts.gstatic.com");
  });
});

describe("CSP headers — Cloudflare Web Analytics (#319)", () => {
  it("production CSP allows Cloudflare Analytics beacon script", () => {
    const csp = buildCsp("production.city");
    expect(csp).toContain("https://static.cloudflareinsights.com");
  });

  it("dev CSP also allows Cloudflare Analytics beacon script", () => {
    const csp = buildCsp("localhost");
    expect(csp).toContain("https://static.cloudflareinsights.com");
  });

  it("script-src includes cloudflareinsights.com origin", () => {
    const csp = buildCsp("production.city");
    // Ensure it's in script-src, not another directive
    const scriptSrc = csp.split(";").find((d: string) => d.trim().startsWith("script-src"));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).toContain("https://static.cloudflareinsights.com");
  });
});
