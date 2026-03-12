import { describe, it, expect } from "vitest";

/**
 * Structure validation tests for vinext web app.
 *
 * These tests verify the project configuration by importing
 * package metadata and checking expected values. They run under
 * @cloudflare/vitest-pool-workers (workerd runtime).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pkg: any;

describe("vinext structure validation", () => {
  it("package.json has vinext dependency", async () => {
    pkg = await import("../../package.json", { with: { type: "json" } });
    const allDeps = {
      ...pkg.default.dependencies,
      ...pkg.default.devDependencies,
    };
    expect(allDeps).toHaveProperty("vinext");
  });

  it("package.json has no hono dependency", async () => {
    pkg = await import("../../package.json", { with: { type: "json" } });
    const allDeps = {
      ...pkg.default.dependencies,
      ...pkg.default.devDependencies,
    };
    expect(allDeps).not.toHaveProperty("hono");
  });

  it("package.json has no @vitejs/plugin-react in devDependencies", async () => {
    pkg = await import("../../package.json", { with: { type: "json" } });
    expect(pkg.default.devDependencies).not.toHaveProperty(
      "@vitejs/plugin-react",
    );
  });

  it("package.json has @cloudflare/vitest-pool-workers", async () => {
    pkg = await import("../../package.json", { with: { type: "json" } });
    expect(pkg.default.devDependencies).toHaveProperty(
      "@cloudflare/vitest-pool-workers",
    );
  });

  it("scripts use vinext commands", async () => {
    pkg = await import("../../package.json", { with: { type: "json" } });
    expect(pkg.default.scripts?.dev).toContain("vinext dev");
    expect(pkg.default.scripts?.build).toContain("vinext build");
    expect(pkg.default.scripts?.deploy).toContain("vinext deploy");
  });

  it("layout component is importable", async () => {
    const layout = await import("../layout");
    expect(typeof layout.default).toBe("function");
  });

  it("page component is importable", async () => {
    const page = await import("../page");
    expect(typeof page.default).toBe("function");
  });
});
