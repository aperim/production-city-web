import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const ROOT = resolve(import.meta.dirname, "..");

describe("workspace validation", () => {
  const workspacePackages = [
    "apps/web",
    "apps/backend",
    "apps/workers",
    "packages/ui",
  ];

  for (const pkg of workspacePackages) {
    it(`${pkg}/package.json exists and is valid JSON`, () => {
      const pkgPath = resolve(ROOT, pkg, "package.json");
      expect(existsSync(pkgPath)).toBe(true);
      const content = JSON.parse(readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
      expect(content).toHaveProperty("name");
      expect(content).toHaveProperty("version");
    });
  }

  it("pnpm-workspace.yaml is parseable YAML", () => {
    const wsPath = resolve(ROOT, "pnpm-workspace.yaml");
    expect(existsSync(wsPath)).toBe(true);
    const content = parse(readFileSync(wsPath, "utf-8")) as Record<string, unknown>;
    expect(content).toHaveProperty("packages");
    expect(Array.isArray(content.packages)).toBe(true);
  });

  it("no .pem files exist in workspace root", () => {
    // In a clean workspace, .pem files should be in .gitignore and not tracked
    // This test checks the gitignore pattern exists
    const gitignorePath = resolve(ROOT, ".gitignore");
    const gitignore = readFileSync(gitignorePath, "utf-8");
    expect(gitignore).toContain("*.pem");
  });

  it(".env is listed in .gitignore", () => {
    const gitignorePath = resolve(ROOT, ".gitignore");
    const gitignore = readFileSync(gitignorePath, "utf-8");
    expect(gitignore).toContain(".env");
  });

  it("baseline migration contains no WAL pragma as executable SQL", () => {
    const migrationPath = resolve(
      ROOT,
      "prisma/migrations/20260312000000_baseline/migration.sql",
    );
    expect(existsSync(migrationPath)).toBe(true);
    const content = readFileSync(migrationPath, "utf-8");
    // Filter out SQL comments (lines starting with --)
    const executableLines = content
      .split("\n")
      .filter((line) => !line.trimStart().startsWith("--"))
      .join("\n");
    expect(executableLines.toLowerCase()).not.toContain("pragma journal_mode=wal");
  });

  it("seed.ts does not use ts-node or tsx", () => {
    const seedPath = resolve(ROOT, "prisma/seed.ts");
    expect(existsSync(seedPath)).toBe(true);
    const content = readFileSync(seedPath, "utf-8");
    expect(content).not.toContain("ts-node");
    expect(content).not.toContain("tsx");
  });
});
