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
    const metaPaths = new Set(["/v1/openapi.json", "/v1/docs"]);

    const undocumented: string[] = [];
    for (const route of app.routes) {
      // Skip meta/utility routes that intentionally aren't in the spec
      if (metaPaths.has(route.path)) continue;
      // Skip middleware (ALL method on wildcard paths like /*)
      const method = route.method.toUpperCase();
      if (method === "ALL" && route.path.includes("*")) continue;
      const key = `${method} ${route.path}`;
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
    expect(paths).toContain("/live");
    expect(paths).toContain("/ready");
  });
});
