// @vitest-environment node
/**
 * Unit tests for the web Worker entry point.
 *
 * Tests the www.production.city → production.city 308 redirect (Issue #97)
 * without importing the full vinext handler, by testing the redirect logic
 * in isolation.
 *
 * CSP tests import the real buildCsp() from worker/csp.ts (PRO-399).
 * A regression guard reads layout.tsx inline scripts and verifies their
 * hashes appear in the production CSP output.
 *
 * @see Issue #97
 * @see PRO-399
 */

import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCsp, THEME_SCRIPT_HASH } from "../csp.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

/**
 * Compute CSP-compatible SHA-256 hash for an inline script body.
 */
function sha256Csp(script: string): string {
  const hash = createHash("sha256").update(script, "utf8").digest("base64");
  return `'sha256-${hash}'`;
}

/**
 * Extract executable inline script bodies from layout.tsx.
 * Matches dangerouslySetInnerHTML={{ __html: `...` }} or '...' or "..."
 * inside <script> tags that are NOT type="application/ld+json".
 *
 * Returns only scripts the browser would execute (no JSON-LD data blocks).
 */
function extractExecutableInlineScripts(): string[] {
  const layoutPath = resolve(__dirname, "../../app/layout.tsx");
  const source = readFileSync(layoutPath, "utf8");

  const scripts: string[] = [];
  // Split on <script to find each script element
  const parts = source.split("<script");
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]!;
    // Skip JSON-LD data blocks — browsers don't execute these
    if (part.includes('type="application/ld+json"')) continue;
    // Extract __html value: backtick-delimited or string-delimited
    const htmlMatch = part.match(/__html:\s*`([^`]*)`/) ??
      part.match(/__html:\s*"([^"]*)"/) ??
      part.match(/__html:\s*'([^']*)'/);
    if (htmlMatch?.[1]) {
      scripts.push(htmlMatch[1]);
    }
  }
  return scripts;
}

// ─── www redirect tests ─────────────────────────────────────────────

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
    const request = new Request("http://www.production.city/page");
    const response = applyWwwRedirect(request);

    expect(response!.headers.get("Location")).toMatch(/^https:\/\//);
  });
});

// ─── CSP tests — real buildCsp from worker/csp.ts ───────────────────

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
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data:");
    expect(csp).toContain("font-src 'self' https://fonts.gstatic.com");
  });
});

/**
 * Inline implementation of hidden-page redirect logic mirroring worker/index.ts (PRO-261).
 * Tests that /company/team redirects to /company for all locale variants.
 */
function applyHiddenPageRedirect(forwardPath: string, locale: string): Response | null {
  if (forwardPath === "/company/team" || forwardPath === "/company/team/") {
    const target = locale === "en" ? "/company" : `/${locale}/company`;
    return new Response(null, {
      status: 302,
      headers: { Location: `https://production.city${target}`, "Cache-Control": "no-cache" },
    });
  }
  return null;
}

describe("Hidden page redirects — /company/team (PRO-261)", () => {
  it("redirects /company/team to /company with 302", () => {
    const response = applyHiddenPageRedirect("/company/team", "en");
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe("https://production.city/company");
    expect(response!.headers.get("Cache-Control")).toBe("no-cache");
  });

  it("redirects /company/team/ (trailing slash) to /company", () => {
    const response = applyHiddenPageRedirect("/company/team/", "en");
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe("https://production.city/company");
  });

  it("redirects locale variant /zh/company/team to /zh/company", () => {
    const response = applyHiddenPageRedirect("/company/team", "zh");
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe("https://production.city/zh/company");
  });

  it("redirects locale variant /ar/company/team to /ar/company", () => {
    const response = applyHiddenPageRedirect("/company/team", "ar");
    expect(response).not.toBeNull();
    expect(response!.status).toBe(302);
    expect(response!.headers.get("Location")).toBe("https://production.city/ar/company");
  });

  it("does not redirect /company (parent page)", () => {
    const response = applyHiddenPageRedirect("/company", "en");
    expect(response).toBeNull();
  });

  it("does not redirect /company/approach", () => {
    const response = applyHiddenPageRedirect("/company/approach", "en");
    expect(response).toBeNull();
  });

  it("does not redirect /company/team/other (subpath)", () => {
    const response = applyHiddenPageRedirect("/company/team/other", "en");
    expect(response).toBeNull();
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
    const scriptSrc = csp.split(";").find((d: string) => d.trim().startsWith("script-src"));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).toContain("https://static.cloudflareinsights.com");
  });
});

// ─── CSP hash-based script allowlist (PRO-399) ─────────────────────

describe("CSP headers — inline script allowlist (PRO-412 hotfix)", () => {
  it("production script-src uses unsafe-inline (hotfix until nonce-based CSP)", () => {
    const csp = buildCsp("production.city");
    const scriptSrc = csp.split(";").find((d: string) => d.trim().startsWith("script-src"))!;
    expect(scriptSrc).toContain("'unsafe-inline'");
  });

  it("dev script-src retains unsafe-inline for hot-reload compatibility", () => {
    const csp = buildCsp("localhost");
    const scriptSrc = csp.split(";").find((d: string) => d.trim().startsWith("script-src"))!;
    expect(scriptSrc).toContain("'unsafe-inline'");
  });

  it("THEME_SCRIPT_HASH is still exported for future nonce migration", () => {
    expect(THEME_SCRIPT_HASH).toMatch(/^'sha256-.+'$/);
  });

  it("THEME_SCRIPT_HASH matches the actual theme script in layout.tsx", () => {
    const scripts = extractExecutableInlineScripts();
    expect(scripts.length).toBeGreaterThanOrEqual(1);

    const themeScript = scripts[0]!;
    const computedHash = sha256Csp(themeScript);
    expect(computedHash).toBe(THEME_SCRIPT_HASH);
  });
});
