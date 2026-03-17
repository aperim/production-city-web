import { describe, it, expect } from "vitest";
import { app } from "../index.js";

/**
 * OpenAPI coverage test — ensures every registered route is documented
 * via .openapi() and appears in the generated OpenAPI spec.
 *
 * Prevents "secret" undocumented routes from being deployed.
 * References: issue #19, issue #98 (API versioning)
 */
describe("OpenAPI coverage", () => {
  it("every registered route appears in the OpenAPI spec", () => {
    // Get the generated OpenAPI 3.1 document
    const spec = app.getOpenAPI31Document({
      openapi: "3.1.0",
      info: { title: "Production City API", version: "1.0.0" },
    });

    const documentedPaths = new Set<string>();
    for (const [path, methods] of Object.entries(spec.paths ?? {})) {
      for (const method of Object.keys(methods ?? {})) {
        documentedPaths.add(`${method.toUpperCase()} ${path}`);
      }
    }

    // Collect all routes registered on the app.
    // Only exclude: meta-routes (/v1/openapi.json, /v1/docs) and middleware
    // registered via app.use() which show up as method "ALL" on "/*".
    // Issue #98: meta paths moved to /v1/ prefix.
    // WebSocket upgrade routes return 101 (not JSON), so they are not OpenAPI routes
    const metaPaths = new Set([
      "/v1/openapi.json", "/v1/docs", "/v1/ws", "/v1/ws/delivery",
      // Home & Inbox endpoints (plain Hono, not OpenAPI) — Issue #395, #397
      "/v1/home/summary", "/v1/inbox", "/v1/inbox/:id", "/v1/inbox/mark-all-read",
    ]);

    // Normalize Hono :param to OpenAPI {param} for matching
    function normalizePath(path: string): string {
      return path.replace(/:([^/]+)/g, "{$1}");
    }

    const undocumented: string[] = [];
    const seen = new Set<string>();
    for (const route of app.routes) {
      // Skip meta/utility routes that intentionally aren't in the spec
      if (metaPaths.has(route.path)) continue;
      // Skip middleware (ALL method — these are auth/csrf/permission middleware, not endpoints)
      const method = route.method.toUpperCase();
      if (method === "ALL") continue;
      const normalizedPath = normalizePath(route.path);
      const key = `${method} ${normalizedPath}`;
      // Deduplicate (Hono may register multiple handlers for the same route)
      if (seen.has(key)) continue;
      seen.add(key);
      if (!documentedPaths.has(key)) {
        undocumented.push(key);
      }
    }

    expect(
      undocumented,
      `Undocumented routes found — register them with app.openapi():\n  ${undocumented.join("\n  ")}`,
    ).toEqual([]);
  });

  it("OpenAPI spec includes all expected routes", () => {
    const spec = app.getOpenAPI31Document({
      openapi: "3.1.0",
      info: { title: "Production City API", version: "1.0.0" },
    });

    const paths = Object.keys(spec.paths ?? {});
    // Health probes
    expect(paths).toContain("/live");
    expect(paths).toContain("/ready");
    // Auth endpoints
    expect(paths).toContain("/v1/auth/verify");
    expect(paths).toContain("/v1/auth/logout");
    expect(paths).toContain("/v1/auth/session");
    // Admin endpoints
    expect(paths).toContain("/v1/admin/users");
    expect(paths).toContain("/v1/admin/users/{id}");
    expect(paths).toContain("/v1/admin/invitations");
    expect(paths).toContain("/v1/admin/approvals");
    expect(paths).toContain("/v1/admin/roles");
    expect(paths).toContain("/v1/admin/permissions");
    expect(paths).toContain("/v1/admin/audit-log");
    // EOI public endpoints
    expect(paths).toContain("/v1/eoi");
    expect(paths).toContain("/v1/eoi/categories");
    expect(paths).toContain("/v1/locales");
    // EOI admin endpoints
    expect(paths).toContain("/v1/admin/eoi");
    expect(paths).toContain("/v1/admin/eoi/{id}");
    expect(paths).toContain("/v1/admin/eoi/stats");
  });
});
