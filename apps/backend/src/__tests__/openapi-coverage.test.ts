import { describe, it, expect } from "vitest";
import { app } from "../index.js";

/**
 * OpenAPI coverage test — ensures every registered route is documented
 * via .openapi() and appears in the generated OpenAPI spec.
 *
 * Prevents "secret" undocumented routes from being deployed.
 * References: issue #19
 */
describe("OpenAPI coverage", () => {
  it("every registered route appears in the OpenAPI spec", () => {
    // Get the generated OpenAPI document
    const spec = app.getOpenAPIDocument({
      openapi: "3.1.0",
      info: { title: "Production City API", version: "0.1.0" },
    });

    const documentedPaths = new Set<string>();
    for (const [path, methods] of Object.entries(spec.paths ?? {})) {
      for (const method of Object.keys(methods ?? {})) {
        documentedPaths.add(`${method.toUpperCase()} ${path}`);
      }
    }

    // Collect all routes registered on the app
    // Exclude internal/meta routes and middleware (catch-all patterns)
    const excludedPaths = new Set(["/openapi.json", "/docs"]);
    const excludedMethods = new Set(["ALL"]);

    const undocumented: string[] = [];
    for (const route of app.routes) {
      if (excludedPaths.has(route.path)) continue;
      if (excludedMethods.has(route.method.toUpperCase())) continue;
      // Skip wildcard/middleware routes (e.g., "/*")
      if (route.path.includes("*")) continue;
      const key = `${route.method.toUpperCase()} ${route.path}`;
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
    const spec = app.getOpenAPIDocument({
      openapi: "3.1.0",
      info: { title: "Production City API", version: "0.1.0" },
    });

    const paths = Object.keys(spec.paths ?? {});
    expect(paths).toContain("/live");
    expect(paths).toContain("/ready");
  });
});
