/**
 * Unit tests for dashboard registry code generation and validation.
 *
 * Covers:
 * - Registry parsing and code generation (#329)
 * - 9 validation rules (#330)
 * - Type generation (#331)
 * - Backend manifest generation (#350)
 *
 * TDD: these tests are written before implementation.
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  type Registry,
  type RegistryFeature,
  parseRegistry,
  validateRegistry,
  generateRoutes,
  generateSidebarConfig,
  generateFeatureIndex,
  generateBackendManifest,
  generateFeatureIdType,
  computeRegistryHash,
  VALID_ROLES,
  VALID_PHASES,
  VALID_PRIORITIES,
} from "../generate-dashboard-routes.js";
import * as fs from "node:fs";
import * as path from "node:path";

const REGISTRY_PATH = path.resolve(
  import.meta.dirname,
  "../../../../docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json",
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid registry for testing with overrides. */
function makeRegistry(overrides?: {
  features?: Partial<RegistryFeature>[];
  sidebarSections?: string[];
  sectionId?: string;
  subsectionId?: string;
}): Registry {
  const sectionId = overrides?.sectionId ?? "home";
  const subsectionId = overrides?.subsectionId ?? "home.overview";
  const defaultFeature: RegistryFeature = {
    id: "home.overview.test",
    label: "Test Feature",
    path: "/dashboard/home/test",
    description: "A test feature",
    status: "planned",
    phase: "company_formation",
    priority: "p1",
    target_quarter: null,
    roles: ["admin"],
    permissions: ["dashboard:admin"],
    bible_ref: null,
    dependencies: [],
    keywords: [],
  };

  const features = overrides?.features
    ? overrides.features.map((f) => ({ ...defaultFeature, ...f }))
    : [defaultFeature];

  return {
    registry_metadata: {
      sidebar_groups: [
        {
          id: "workspace",
          label: "Your Workspace",
          sections: overrides?.sidebarSections ?? [sectionId],
        },
      ],
    },
    sections: [
      {
        id: sectionId,
        label: "Dashboard",
        icon: "home",
        path: "/dashboard",
        description: "Home section",
        subsections: [
          {
            id: subsectionId,
            label: "Overview",
            features,
          },
        ],
      },
    ],
  };
}

// ===========================================================================
// #329 — Registry parsing and code generation
// ===========================================================================

describe("parseRegistry", () => {
  it("parses the full production registry JSON", () => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = parseRegistry(raw);
    expect(registry.sections.length).toBe(26);
    expect(registry.registry_metadata.sidebar_groups.length).toBe(9);
  });

  it("parses a minimal registry", () => {
    const registry = makeRegistry();
    expect(registry.sections).toHaveLength(1);
    expect(registry.sections[0].subsections[0].features).toHaveLength(1);
  });
});

describe("generateRoutes", () => {
  let fullRegistry: Registry;

  beforeAll(() => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    fullRegistry = parseRegistry(raw);
  });

  it("generates a valid TypeScript module string", () => {
    const output = generateRoutes(fullRegistry);
    expect(output).toContain("export const DASHBOARD_ROUTES");
    expect(output).toContain("DashboardRoute[]");
  });

  it("includes all 502 features", () => {
    const output = generateRoutes(fullRegistry);
    // Each route object should have an id field
    const idMatches = output.match(/id: '/g);
    expect(idMatches).toHaveLength(502);
  });

  it("includes correct fields for each route entry", () => {
    const output = generateRoutes(makeRegistry());
    expect(output).toContain("id: 'home.overview.test'");
    expect(output).toContain("path: '/dashboard/home/test'");
    expect(output).toContain("roles: ['admin']");
    expect(output).toContain("permissions: ['dashboard:admin']");
    expect(output).toContain("status: 'planned'");
    expect(output).toContain("phase: 'company_formation'");
    expect(output).toContain("priority: 'p1'");
    expect(output).toContain("dependencies: []");
  });

  it("handles empty registry gracefully", () => {
    const registry = makeRegistry({ features: [] });
    const output = generateRoutes(registry);
    expect(output).toContain("export const DASHBOARD_ROUTES: DashboardRoute[] = [\n];");
    expect(output).toContain("export type FeatureId = never;");
  });
});

describe("generateSidebarConfig", () => {
  let fullRegistry: Registry;

  beforeAll(() => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    fullRegistry = parseRegistry(raw);
  });

  it("generates valid TypeScript with SidebarGroup type", () => {
    const output = generateSidebarConfig(fullRegistry);
    expect(output).toContain("export const SIDEBAR_CONFIG: SidebarGroup[]");
  });

  it("contains all 9 sidebar groups", () => {
    const output = generateSidebarConfig(fullRegistry);
    const groupMatches = output.match(/id: '/g);
    // 9 groups + sections within them + subsections
    expect(groupMatches!.length).toBeGreaterThanOrEqual(9);
  });

  it("includes section labels and icons", () => {
    const output = generateSidebarConfig(fullRegistry);
    expect(output).toContain("icon: 'home'");
    expect(output).toContain("label: 'Dashboard'");
  });
});

describe("generateFeatureIndex", () => {
  let fullRegistry: Registry;

  beforeAll(() => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    fullRegistry = parseRegistry(raw);
  });

  it("generates valid TypeScript with FeatureSearchEntry type", () => {
    const output = generateFeatureIndex(fullRegistry);
    expect(output).toContain("export const FEATURE_INDEX: FeatureSearchEntry[]");
  });

  it("includes all 502 features in the index", () => {
    const output = generateFeatureIndex(fullRegistry);
    const idMatches = output.match(/id: '/g);
    expect(idMatches).toHaveLength(502);
  });

  it("includes section and subsection labels", () => {
    const output = generateFeatureIndex(makeRegistry());
    expect(output).toContain("section: 'Dashboard'");
    expect(output).toContain("subsection: 'Overview'");
  });

  it("includes keywords when present", () => {
    const registry = makeRegistry({
      features: [
        {
          id: "test.search",
          label: "Search Test",
          path: "/dashboard/test/search",
          keywords: ["find", "query"],
        },
      ],
    });
    const output = generateFeatureIndex(registry);
    expect(output).toContain("keywords: ['find', 'query']");
  });
});

// ===========================================================================
// #330 — Validation suite (9 rules)
// ===========================================================================

describe("validateRegistry", () => {
  it("passes for a valid minimal registry", () => {
    const errors = validateRegistry(makeRegistry());
    expect(errors).toHaveLength(0);
  });

  // Rule 1: Unique IDs
  it("detects duplicate feature IDs", () => {
    const registry = makeRegistry({
      features: [
        { id: "dupe.id", path: "/dashboard/a" },
        { id: "dupe.id", path: "/dashboard/b" },
      ],
    });
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "unique-ids")).toBe(true);
  });

  // Rule 2: Unique paths
  it("detects duplicate paths", () => {
    const registry = makeRegistry({
      features: [
        { id: "feat.a", path: "/dashboard/same" },
        { id: "feat.b", path: "/dashboard/same" },
      ],
    });
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "unique-paths")).toBe(true);
  });

  // Rule 3: Valid dependencies
  it("detects invalid dependency references", () => {
    const registry = makeRegistry({
      features: [
        { id: "feat.a", path: "/dashboard/a", dependencies: ["nonexistent.feature"] },
      ],
    });
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "valid-dependencies")).toBe(true);
  });

  it("accepts valid dependency references", () => {
    const registry = makeRegistry({
      features: [
        { id: "feat.a", path: "/dashboard/a", dependencies: [] },
        { id: "feat.b", path: "/dashboard/b", dependencies: ["feat.a"] },
      ],
    });
    const errors = validateRegistry(registry);
    expect(errors.filter((e) => e.rule === "valid-dependencies")).toHaveLength(0);
  });

  // Rule 4: Valid roles
  it("detects invalid role names", () => {
    const registry = makeRegistry({
      features: [
        { id: "feat.a", path: "/dashboard/a", roles: ["admin", "superuser" as never] },
      ],
    });
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "valid-roles")).toBe(true);
  });

  // Rule 5: Valid phases
  it("detects invalid phase values", () => {
    const registry = makeRegistry({
      features: [
        { id: "feat.a", path: "/dashboard/a", phase: "launch" as never },
      ],
    });
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "valid-phases")).toBe(true);
  });

  // Rule 6: Valid priorities
  it("detects invalid priority values", () => {
    const registry = makeRegistry({
      features: [
        { id: "feat.a", path: "/dashboard/a", priority: "p5" as never },
      ],
    });
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "valid-priorities")).toBe(true);
  });

  // Rule 7: No orphan features — every feature reachable from sidebar_groups
  it("detects orphan features not reachable from sidebar_groups", () => {
    const registry = makeRegistry({
      sidebarSections: ["nonexistent_section"],
      sectionId: "home",
    });
    // The section "home" exists but sidebar references "nonexistent_section"
    // so "home" section's features are orphans
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "no-orphan-features")).toBe(true);
  });

  // Rule 8: Sidebar completeness — every section ref in sidebar exists
  it("detects sidebar references to non-existent sections", () => {
    const registry = makeRegistry({
      sidebarSections: ["home", "ghost_section"],
    });
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "sidebar-completeness")).toBe(true);
  });

  // Rule 9: Path format — must start with /dashboard/, lowercase + hyphens
  it("detects paths not starting with /dashboard/", () => {
    const registry = makeRegistry({
      features: [{ id: "feat.a", path: "/admin/stuff" }],
    });
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "path-format")).toBe(true);
  });

  it("detects paths with uppercase characters", () => {
    const registry = makeRegistry({
      features: [{ id: "feat.a", path: "/dashboard/Admin" }],
    });
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "path-format")).toBe(true);
  });

  it("detects paths with underscores", () => {
    const registry = makeRegistry({
      features: [{ id: "feat.a", path: "/dashboard/some_page" }],
    });
    const errors = validateRegistry(registry);
    expect(errors.some((e) => e.rule === "path-format")).toBe(true);
  });

  it("accepts the bare /dashboard path", () => {
    const registry = makeRegistry({
      features: [{ id: "feat.a", path: "/dashboard" }],
    });
    const errors = validateRegistry(registry);
    expect(errors.filter((e) => e.rule === "path-format")).toHaveLength(0);
  });

  // Canonical feature count
  it("validates the full production registry has exactly 502 features", () => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = parseRegistry(raw);
    const errors = validateRegistry(registry, { expectedFeatureCount: 502 });
    expect(errors.filter((e) => e.rule === "feature-count")).toHaveLength(0);
  });

  it("fails when feature count does not match expected", () => {
    const registry = makeRegistry();
    const errors = validateRegistry(registry, { expectedFeatureCount: 100 });
    expect(errors.some((e) => e.rule === "feature-count")).toBe(true);
  });

  // Full production registry passes all validation
  it("full production registry passes all validation rules", () => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = parseRegistry(raw);
    const errors = validateRegistry(registry, { expectedFeatureCount: 502 });
    if (errors.length > 0) {
      console.error("Validation errors:", errors);
    }
    expect(errors).toHaveLength(0);
  });
});

// ===========================================================================
// #331 — Generated TypeScript types
// ===========================================================================

describe("generateFeatureIdType", () => {
  it("generates a union type string", () => {
    const registry = makeRegistry({
      features: [
        { id: "a.b.c", path: "/dashboard/a" },
        { id: "d.e.f", path: "/dashboard/b" },
      ],
    });
    const output = generateFeatureIdType(registry);
    expect(output).toContain("export type FeatureId =");
    expect(output).toContain("| 'a.b.c'");
    expect(output).toContain("| 'd.e.f'");
  });

  it("generates 502-member union for production registry", () => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = parseRegistry(raw);
    const output = generateFeatureIdType(registry);
    const members = output.match(/\| '/g);
    expect(members).toHaveLength(502);
  });
});

// ===========================================================================
// #350 — Backend manifest
// ===========================================================================

describe("generateBackendManifest", () => {
  it("generates TypeScript with route manifest array", () => {
    const registry = makeRegistry();
    const hash = "abc123";
    const output = generateBackendManifest(registry, hash);
    expect(output).toContain("export const ROUTE_MANIFEST");
    expect(output).toContain("export const REGISTRY_HASH");
    expect(output).toContain(`'${hash}'`);
  });

  it("includes feature IDs, roles, and permissions", () => {
    const registry = makeRegistry({
      features: [
        {
          id: "test.feat",
          path: "/dashboard/test",
          roles: ["admin", "executive"],
          permissions: ["dashboard:admin", "test:read"],
        },
      ],
    });
    const output = generateBackendManifest(registry, "hash123");
    expect(output).toContain("id: 'test.feat'");
    expect(output).toContain("roles: ['admin', 'executive']");
    expect(output).toContain("permissions: ['dashboard:admin', 'test:read']");
  });

  it("includes all 502 features for production registry", () => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = parseRegistry(raw);
    const output = generateBackendManifest(registry, "hash");
    const idMatches = output.match(/id: '/g);
    expect(idMatches).toHaveLength(502);
  });
});

describe("computeRegistryHash", () => {
  it("returns a consistent SHA-256 hash", () => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const hash1 = computeRegistryHash(raw);
    const hash2 = computeRegistryHash(raw);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("changes when content changes", () => {
    const hash1 = computeRegistryHash("content1");
    const hash2 = computeRegistryHash("content2");
    expect(hash1).not.toBe(hash2);
  });
});

// ===========================================================================
// Web and backend manifest consistency (#350)
// ===========================================================================

describe("web/backend manifest consistency", () => {
  it("both manifests use the same registry hash", () => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = parseRegistry(raw);
    const hash = computeRegistryHash(raw);
    const routes = generateRoutes(registry, hash);
    const manifest = generateBackendManifest(registry, hash);
    // Both should contain the same hash value
    expect(routes).toContain(hash);
    expect(manifest).toContain(hash);
  });

  it("both manifests contain the same feature IDs", () => {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    const registry = parseRegistry(raw);
    const hash = computeRegistryHash(raw);
    const routes = generateRoutes(registry, hash);
    const manifest = generateBackendManifest(registry, hash);

    // Extract IDs from both
    const routeIds = [...routes.matchAll(/id: '([^']+)'/g)].map((m) => m[1]).sort();
    const manifestIds = [...manifest.matchAll(/id: '([^']+)'/g)].map((m) => m[1]).sort();
    expect(routeIds).toEqual(manifestIds);
  });
});

// ===========================================================================
// Constants
// ===========================================================================

describe("constants", () => {
  it("exports 10 valid roles", () => {
    expect(VALID_ROLES).toHaveLength(10);
    expect(VALID_ROLES).toContain("admin");
    expect(VALID_ROLES).toContain("first_nations");
  });

  it("exports 7 valid phases", () => {
    expect(VALID_PHASES).toHaveLength(7);
    expect(VALID_PHASES).toContain("company_formation");
    expect(VALID_PHASES).toContain("expansion");
  });

  it("exports 4 valid priorities", () => {
    expect(VALID_PRIORITIES).toHaveLength(4);
    expect(VALID_PRIORITIES).toContain("p0");
    expect(VALID_PRIORITIES).toContain("p3");
  });
});
