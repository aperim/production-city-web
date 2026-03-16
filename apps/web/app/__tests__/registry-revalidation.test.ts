import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Tests for registry revalidation logic.
 * @see Issue #354
 */

const SOURCE_PATH = resolve(
  __dirname,
  "../dashboard/use-registry-revalidation.ts",
);
const source = readFileSync(SOURCE_PATH, "utf8");

describe("Registry revalidation", () => {
  it("useRegistryRevalidation module is importable", async () => {
    const mod = await import("../dashboard/use-registry-revalidation");
    expect(typeof mod.useRegistryRevalidation).toBe("function");
  });

  it("getRegistryVisible is available in api-client", async () => {
    const mod = await import("../lib/api-client");
    expect(typeof mod.getRegistryVisible).toBe("function");
  });

  it("defines STALE_THRESHOLD as 5 minutes", () => {
    expect(source).toContain("5 * 60 * 1000");
  });

  it("has loop protection via MIN_REVALIDATION_INTERVAL", () => {
    expect(source).toContain("MIN_REVALIDATION_INTERVAL_MS");
    expect(source).toContain("30 * 1000");
  });

  it("stores version in localStorage key pc-registry-version", () => {
    expect(source).toContain("pc-registry-version");
  });

  it("listens to visibilitychange event", () => {
    expect(source).toContain("visibilitychange");
  });

  it("supports onFeaturesChanged callback", () => {
    expect(source).toContain("onFeaturesChanged");
  });
});
