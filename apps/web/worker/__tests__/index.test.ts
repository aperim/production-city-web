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
