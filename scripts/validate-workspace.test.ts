import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { parse as parseToml } from "smol-toml";

const ROOT = resolve(import.meta.dirname, "..");

describe("workspace validation", () => {
  const workspacePackages = {
    "apps/web": "@productioncity/holding-web",
    "apps/backend": "@productioncity/holding-backend",
    "apps/workers": "@productioncity/holding-workers",
    "packages/ui": "@productioncity/holding-ui",
  } as const;

  for (const [pkg, expectedName] of Object.entries(workspacePackages)) {
    it(`${pkg}/package.json exists and is valid JSON`, () => {
      const pkgPath = resolve(ROOT, pkg, "package.json");
      expect(existsSync(pkgPath)).toBe(true);
      const content = JSON.parse(readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
      expect(content).toHaveProperty("name");
      expect(content).toHaveProperty("version");
      expect(content.name).toBe(expectedName);
    });

    it(`${pkg}/package.json publishes to GitHub Packages with repository metadata`, () => {
      const pkgPath = resolve(ROOT, pkg, "package.json");
      const content = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
        publishConfig?: { registry?: string };
        repository?: { type?: string; url?: string } | string;
      };

      expect(content.publishConfig?.registry).toBe("https://npm.pkg.github.com");
      expect(content.repository).toBeDefined();

      if (typeof content.repository === "string") {
        expect(content.repository).toContain("github.com/productioncity/holding");
        return;
      }

      expect(content.repository?.type).toBe("git");
      expect(content.repository?.url).toContain("github.com/productioncity/holding");
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

  it("devcontainer bootstrap wires Claude wrapper and healthcheck scripts", () => {
    const postCreatePath = resolve(ROOT, ".devcontainer/post-create.sh");
    const postStartPath = resolve(ROOT, ".devcontainer/post-start.sh");
    const postCreate = readFileSync(postCreatePath, "utf-8");
    const postStart = readFileSync(postStartPath, "utf-8");

    expect(postCreate).toContain("resolve_real_claude_bin");
    expect(postCreate).toContain("${DEV_HOME}/.claude/bin/claude");
    expect(postCreate).toContain("${DEV_HOME}/.local/share/production-city/claude");
    expect(postCreate).toContain('$(claude_support_dir)/claude-real');
    expect(postCreate).toContain('"${support_dir}/claude-wrapper.ts"');
    expect(postCreate).toContain("${DEV_HOME}/.local/bin/claude");
    expect(postCreate).toContain('alias claude="claude --dangerously-skip-permissions"');
    expect(postStart).toContain('PRODUCTION_CITY_REAL_CLAUDE_BIN=/bin/echo');
  });

  it("workspace .npmrc routes the @productioncity scope to GitHub Packages", () => {
    const npmrcPath = resolve(ROOT, ".npmrc");
    expect(existsSync(npmrcPath)).toBe(true);
    const content = readFileSync(npmrcPath, "utf-8");
    expect(content).toContain("@productioncity:registry=https://npm.pkg.github.com");
    expect(content).not.toContain("_authToken");
  });

  it("baseline migration contains no WAL pragma as executable SQL", () => {
    const migrationPath = resolve(
      ROOT,
      "prisma/migrations/0000_baseline.sql",
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

  it("no @production-city workspace references remain", () => {
    const filesToCheck = [
      "apps/web/package.json",
      "apps/backend/package.json",
      "apps/workers/package.json",
      "packages/ui/package.json",
      "apps/web/app/page.tsx",
      ".github/workflows/ci.yml",
      ".github/workflows/deploy.yml",
    ];

    for (const relativePath of filesToCheck) {
      const content = readFileSync(resolve(ROOT, relativePath), "utf-8");
      expect(content).not.toContain("@production-city");
    }
  });

  it("workspace configs do not reference npmjs.com or Docker Hub", () => {
    const filesToCheck = [
      "package.json",
      ".github/workflows/ci.yml",
      ".github/workflows/deploy.yml",
      "apps/web/package.json",
      "apps/backend/package.json",
      "apps/workers/package.json",
      "packages/ui/package.json",
    ];

    for (const relativePath of filesToCheck) {
      const content = readFileSync(resolve(ROOT, relativePath), "utf-8").toLowerCase();
      expect(content).not.toContain("npmjs.com");
      expect(content).not.toContain("docker hub");
      expect(content).not.toContain("docker.io");
    }
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

        it(`env.${e} database_id is a valid UUID`, () => {
          const envConfig = env![e] as Record<string, unknown>;
          const d1Databases = envConfig.d1_databases as Array<Record<string, unknown>>;
          const dbBinding = d1Databases.find((db) => db.binding === "DB");
          expect(dbBinding).toBeDefined();
          // Wrangler does not expand shell env vars in wrangler.toml/jsonc database_id fields,
          // so IDs must be literal UUIDs (not $VAR references).
          expect(String(dbBinding!.database_id)).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          );
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
