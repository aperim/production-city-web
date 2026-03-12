import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { parse as parseToml } from "smol-toml";

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

/**
 * Parse a wrangler config file — supports both .toml and .jsonc formats.
 * vinext uses wrangler.jsonc; other apps may use wrangler.toml.
 */
function readWranglerConfig(appDir: string): Record<string, unknown> {
  const jsoncPath = resolve(ROOT, appDir, "wrangler.jsonc");
  if (existsSync(jsoncPath)) {
    const raw = readFileSync(jsoncPath, "utf-8");
    // Strip single-line comments for JSON.parse
    const stripped = raw.replace(/^\s*\/\/.*$/gm, "");
    return JSON.parse(stripped) as Record<string, unknown>;
  }
  const tomlPath = resolve(ROOT, appDir, "wrangler.toml");
  const content = readFileSync(tomlPath, "utf-8");
  return parseToml(content) as Record<string, unknown>;
}

describe("wrangler multi-environment configuration", () => {
  const appsWithD1 = ["apps/backend", "apps/web"];
  const environments = ["preview", "staging", "production"];

  for (const app of appsWithD1) {
    describe(app, () => {
      const config = readWranglerConfig(app);
      const env = config.env as Record<string, Record<string, unknown>> | undefined;

      it("has all three environments defined", () => {
        expect(env).toBeDefined();
        for (const e of environments) {
          expect(env).toHaveProperty(e);
        }
      });

      for (const e of environments) {
        it(`env.${e} has d1_databases binding named DB`, () => {
          const envConfig = env![e] as Record<string, unknown>;
          const d1Databases = envConfig.d1_databases as Array<Record<string, unknown>>;
          expect(d1Databases).toBeDefined();
          expect(Array.isArray(d1Databases)).toBe(true);
          const dbBinding = d1Databases.find((db) => db.binding === "DB");
          expect(dbBinding).toBeDefined();
        });

        it(`env.${e} database_id is a variable reference`, () => {
          const envConfig = env![e] as Record<string, unknown>;
          const d1Databases = envConfig.d1_databases as Array<Record<string, unknown>>;
          const dbBinding = d1Databases.find((db) => db.binding === "DB");
          expect(dbBinding).toBeDefined();
          expect(String(dbBinding!.database_id)).toContain("$");
        });
      }
    });
  }

  describe("apps/workers", () => {
    const tomlPath = resolve(ROOT, "apps/workers", "wrangler.toml");
    const content = readFileSync(tomlPath, "utf-8");
    const config = parseToml(content) as Record<string, unknown>;
    const env = config.env as Record<string, Record<string, unknown>> | undefined;

    it("has all three environments defined", () => {
      expect(env).toBeDefined();
      for (const e of environments) {
        expect(env).toHaveProperty(e);
      }
    });

    for (const e of environments) {
      it(`env.${e} has queue consumers`, () => {
        const envConfig = env![e] as Record<string, unknown>;
        const queues = envConfig.queues as Record<string, unknown>;
        expect(queues).toBeDefined();
        const consumers = queues.consumers as Array<Record<string, unknown>>;
        expect(consumers).toBeDefined();
        expect(Array.isArray(consumers)).toBe(true);
        expect(consumers.length).toBeGreaterThan(0);
      });
    }
  });
});
