import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Structure validation tests for the vinext web app.
 *
 * Verifies critical project configuration constraints: vinext usage,
 * wrangler.jsonc format (required by vinext), correct vitest setup,
 * and absence of forbidden dependencies.
 */

const WEB_ROOT = resolve(import.meta.dirname, "../..");

describe("vinext structure validation", () => {
  it("app/layout.tsx exists", () => {
    expect(existsSync(resolve(WEB_ROOT, "app/layout.tsx"))).toBe(true);
  });

  it("app/page.tsx exists", () => {
    expect(existsSync(resolve(WEB_ROOT, "app/page.tsx"))).toBe(true);
  });

  it("wrangler.jsonc exists (not wrangler.toml — vinext requires .jsonc)", () => {
    expect(existsSync(resolve(WEB_ROOT, "wrangler.jsonc"))).toBe(true);
    expect(existsSync(resolve(WEB_ROOT, "wrangler.toml"))).toBe(false);
  });

  it("has vinext dependency", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(WEB_ROOT, "package.json"), "utf-8"),
    ) as Record<string, Record<string, string>>;
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps).toHaveProperty("vinext");
  });

  it("no hono dependency", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(WEB_ROOT, "package.json"), "utf-8"),
    ) as Record<string, Record<string, string>>;
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(allDeps).not.toHaveProperty("hono");
  });

  it("no @vitejs/plugin-react in devDependencies", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(WEB_ROOT, "package.json"), "utf-8"),
    ) as Record<string, Record<string, string>>;
    expect(pkg.devDependencies).not.toHaveProperty("@vitejs/plugin-react");
  });

  it("no @cloudflare/vitest-pool-workers in apps/web (apps/backend and apps/workers only)", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(WEB_ROOT, "package.json"), "utf-8"),
    ) as Record<string, Record<string, string>>;
    expect(pkg.devDependencies).not.toHaveProperty(
      "@cloudflare/vitest-pool-workers",
    );
  });

  it("scripts use vinext commands", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(WEB_ROOT, "package.json"), "utf-8"),
    ) as Record<string, Record<string, string>>;
    expect(pkg.scripts?.dev).toContain("vinext dev");
    expect(pkg.scripts?.build).toContain("vinext build");
    expect(pkg.scripts?.deploy).toContain("vinext deploy");
  });

  it("vite.config.ts uses vinext() plugin", () => {
    const config = readFileSync(resolve(WEB_ROOT, "vite.config.ts"), "utf-8");
    expect(config).toContain("vinext()");
    expect(config).not.toContain("react()");
  });
});
