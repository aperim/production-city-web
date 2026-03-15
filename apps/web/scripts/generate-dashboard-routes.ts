/**
 * Registry code generation script for the Production City dashboard.
 *
 * Reads the feature registry JSON and outputs:
 * - apps/web/app/dashboard/_generated/routes.ts (flat route array + FeatureId type)
 * - apps/web/app/dashboard/_generated/sidebar-config.ts (hierarchical sidebar)
 * - apps/web/app/dashboard/_generated/feature-index.ts (CommandBar search index)
 * - apps/backend/src/_generated/route-manifest.ts (backend route manifest)
 *
 * @see Issue #329, #330, #331, #350
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const VALID_ROLES = [
  "admin",
  "executive",
  "staff",
  "client",
  "vendor",
  "investor",
  "guest",
  "government",
  "partner",
  "first_nations",
] as const;

export const VALID_PHASES = [
  "company_formation",
  "site_acquisition",
  "planning_approvals",
  "design_construct",
  "pre_operations",
  "operations",
  "expansion",
] as const;

export const VALID_PRIORITIES = ["p0", "p1", "p2", "p3"] as const;

export const VALID_STATUSES = ["planned", "coming_soon", "active", "deprecated"] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RegistryFeature {
  id: string;
  label: string;
  path: string;
  description: string;
  status: string;
  phase: string;
  priority: string;
  target_quarter: string | null;
  roles: string[];
  permissions: string[];
  bible_ref: string | null;
  dependencies: string[];
  keywords?: string[];
}

export interface RegistrySubsection {
  id: string;
  label: string;
  features: RegistryFeature[];
}

export interface RegistrySection {
  id: string;
  label: string;
  icon: string;
  path: string;
  description: string;
  subsections: RegistrySubsection[];
}

export interface SidebarGroupMeta {
  id: string;
  label: string;
  sections: string[];
}

export interface RegistryMetadata {
  sidebar_groups: SidebarGroupMeta[];
}

export interface Registry {
  registry_metadata: RegistryMetadata;
  sections: RegistrySection[];
}

export interface ValidationError {
  rule: string;
  featureId?: string;
  message: string;
}

interface ValidateOptions {
  expectedFeatureCount?: number;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export function parseRegistry(raw: string): Registry {
  const data = JSON.parse(raw);

  // Structural validation — fail fast on malformed JSON shape
  if (!data || typeof data !== "object") {
    throw new Error("Registry JSON must be an object");
  }
  if (!data.registry_metadata || !Array.isArray(data.registry_metadata.sidebar_groups)) {
    throw new Error("Registry JSON must have registry_metadata.sidebar_groups array");
  }
  if (!Array.isArray(data.sections)) {
    throw new Error("Registry JSON must have sections array");
  }
  for (const section of data.sections) {
    if (!section || typeof section !== "object" || !Array.isArray(section.subsections)) {
      throw new Error(`Section '${section?.id ?? "unknown"}' must have subsections array`);
    }
    for (const sub of section.subsections) {
      if (!sub || typeof sub !== "object" || !Array.isArray(sub.features)) {
        throw new Error(`Subsection '${sub?.id ?? "unknown"}' must have features array`);
      }
    }
  }

  return data as Registry;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAllFeatures(registry: Registry): RegistryFeature[] {
  const features: RegistryFeature[] = [];
  for (const section of registry.sections) {
    for (const sub of section.subsections) {
      for (const f of sub.features) {
        features.push(f);
      }
    }
  }
  return features;
}

function escapeString(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function formatStringArray(arr: string[]): string {
  if (arr.length === 0) return "[]";
  return `[${arr.map((s) => `'${escapeString(s)}'`).join(", ")}]`;
}

// ---------------------------------------------------------------------------
// Validation (#330)
// ---------------------------------------------------------------------------

export function validateRegistry(
  registry: Registry,
  options?: ValidateOptions,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const features = getAllFeatures(registry);
  const featureIds = new Set<string>();
  const featurePaths = new Set<string>();
  const allFeatureIdSet = new Set(features.map((f) => f.id));
  const sectionIdSet = new Set(registry.sections.map((s) => s.id));

  // Collect all section IDs referenced from sidebar
  const sidebarSectionIds = new Set<string>();
  for (const group of registry.registry_metadata.sidebar_groups) {
    for (const sectionId of group.sections) {
      sidebarSectionIds.add(sectionId);
    }
  }

  // Collect section IDs that are reachable from sidebar
  const reachableSectionIds = new Set<string>();
  for (const sectionId of sidebarSectionIds) {
    if (sectionIdSet.has(sectionId)) {
      reachableSectionIds.add(sectionId);
    }
  }

  for (const feature of features) {
    // Rule 1: Unique IDs
    if (featureIds.has(feature.id)) {
      errors.push({
        rule: "unique-ids",
        featureId: feature.id,
        message: `Duplicate feature ID: ${feature.id}`,
      });
    }
    featureIds.add(feature.id);

    // Rule 2: Unique paths
    if (featurePaths.has(feature.path)) {
      errors.push({
        rule: "unique-paths",
        featureId: feature.id,
        message: `Duplicate path: ${feature.path}`,
      });
    }
    featurePaths.add(feature.path);

    // Rule 3: Valid dependencies
    for (const dep of feature.dependencies) {
      if (!allFeatureIdSet.has(dep)) {
        errors.push({
          rule: "valid-dependencies",
          featureId: feature.id,
          message: `Dependency '${dep}' does not exist`,
        });
      }
    }

    // Rule 4: Valid roles
    for (const role of feature.roles) {
      if (!(VALID_ROLES as readonly string[]).includes(role)) {
        errors.push({
          rule: "valid-roles",
          featureId: feature.id,
          message: `Invalid role: ${role}`,
        });
      }
    }

    // Rule 5: Valid phases
    if (!(VALID_PHASES as readonly string[]).includes(feature.phase)) {
      errors.push({
        rule: "valid-phases",
        featureId: feature.id,
        message: `Invalid phase: ${feature.phase}`,
      });
    }

    // Rule 6: Valid priorities
    if (!(VALID_PRIORITIES as readonly string[]).includes(feature.priority)) {
      errors.push({
        rule: "valid-priorities",
        featureId: feature.id,
        message: `Invalid priority: ${feature.priority}`,
      });
    }

    // Rule 9: Path format
    if (feature.path !== "/dashboard" && !feature.path.startsWith("/dashboard/")) {
      errors.push({
        rule: "path-format",
        featureId: feature.id,
        message: `Path must start with /dashboard/ (or be exactly /dashboard): ${feature.path}`,
      });
    } else if (feature.path !== "/dashboard") {
      const pathAfterDashboard = feature.path.slice("/dashboard/".length);
      if (pathAfterDashboard !== pathAfterDashboard.toLowerCase()) {
        errors.push({
          rule: "path-format",
          featureId: feature.id,
          message: `Path must be lowercase: ${feature.path}`,
        });
      }
      if (pathAfterDashboard.includes("_")) {
        errors.push({
          rule: "path-format",
          featureId: feature.id,
          message: `Path must use hyphens, not underscores: ${feature.path}`,
        });
      }
      if (!/^[a-z0-9\-/]+$/.test(pathAfterDashboard)) {
        errors.push({
          rule: "path-format",
          featureId: feature.id,
          message: `Path contains invalid characters (only lowercase, digits, hyphens, slashes allowed): ${feature.path}`,
        });
      }
      if (pathAfterDashboard.includes("//") || pathAfterDashboard.endsWith("/")) {
        errors.push({
          rule: "path-format",
          featureId: feature.id,
          message: `Path has empty segments or trailing slash: ${feature.path}`,
        });
      }
    }
  }

  // Rule 7: No orphan features — every section with features must be reachable from sidebar
  for (const section of registry.sections) {
    const hasFeatures = section.subsections.some((sub) => sub.features.length > 0);
    if (hasFeatures && !reachableSectionIds.has(section.id)) {
      errors.push({
        rule: "no-orphan-features",
        message: `Section '${section.id}' has features but is not reachable from sidebar_groups`,
      });
    }
  }

  // Rule 8: Sidebar completeness — every section ref in sidebar exists
  for (const group of registry.registry_metadata.sidebar_groups) {
    for (const sectionId of group.sections) {
      if (!sectionIdSet.has(sectionId)) {
        errors.push({
          rule: "sidebar-completeness",
          message: `Sidebar group '${group.id}' references non-existent section '${sectionId}'`,
        });
      }
    }
  }

  // Feature count check
  if (options?.expectedFeatureCount !== undefined) {
    if (features.length !== options.expectedFeatureCount) {
      errors.push({
        rule: "feature-count",
        message: `Expected ${options.expectedFeatureCount} features, found ${features.length}`,
      });
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Hash (#329 AC, #350)
// ---------------------------------------------------------------------------

export function computeRegistryHash(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// ---------------------------------------------------------------------------
// Code generation: routes.ts (#329, #331)
// ---------------------------------------------------------------------------

export function generateRoutes(registry: Registry, registryHash?: string): string {
  const features = getAllFeatures(registry);
  const lines: string[] = [];

  lines.push("// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.");
  lines.push("// @generated");
  lines.push("");

  // FeatureId union type (#331)
  lines.push(generateFeatureIdType(registry));
  lines.push("");

  // DashboardRoute type
  lines.push("export interface DashboardRoute {");
  lines.push("  id: FeatureId;");
  lines.push("  path: string;");
  lines.push("  roles: string[];");
  lines.push("  permissions: string[];");
  lines.push("  status: string;");
  lines.push("  phase: string;");
  lines.push("  priority: string;");
  lines.push("  dependencies: FeatureId[];");
  lines.push("}");
  lines.push("");

  // Registry hash
  if (registryHash) {
    lines.push(`export const REGISTRY_HASH = '${registryHash}';`);
    lines.push("");
  }

  // Route array
  lines.push("export const DASHBOARD_ROUTES: DashboardRoute[] = [");
  for (const f of features) {
    lines.push(`  { id: '${escapeString(f.id)}', path: '${escapeString(f.path)}', roles: ${formatStringArray(f.roles)}, permissions: ${formatStringArray(f.permissions)}, status: '${escapeString(f.status)}', phase: '${escapeString(f.phase)}', priority: '${escapeString(f.priority)}', dependencies: ${formatStringArray(f.dependencies)} },`);
  }
  lines.push("];");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Code generation: FeatureId type (#331)
// ---------------------------------------------------------------------------

export function generateFeatureIdType(registry: Registry): string {
  const features = getAllFeatures(registry);
  if (features.length === 0) {
    return "export type FeatureId = never;";
  }
  const lines: string[] = [];
  lines.push("export type FeatureId =");
  for (const f of features) {
    lines.push(`  | '${escapeString(f.id)}'`);
  }
  lines.push("  ;");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Code generation: sidebar-config.ts (#329)
// ---------------------------------------------------------------------------

export function generateSidebarConfig(registry: Registry): string {
  const lines: string[] = [];
  const sectionMap = new Map(registry.sections.map((s) => [s.id, s]));

  lines.push("// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.");
  lines.push("// @generated");
  lines.push("");

  // SidebarSubsection type
  lines.push("export interface SidebarSubsection {");
  lines.push("  id: string;");
  lines.push("  label: string;");
  lines.push("  featureIds: string[];");
  lines.push("}");
  lines.push("");

  // SidebarSection type
  lines.push("export interface SidebarSection {");
  lines.push("  id: string;");
  lines.push("  label: string;");
  lines.push("  icon: string;");
  lines.push("  path: string;");
  lines.push("  subsections: SidebarSubsection[];");
  lines.push("}");
  lines.push("");

  // SidebarGroup type
  lines.push("export interface SidebarGroup {");
  lines.push("  id: string;");
  lines.push("  label: string;");
  lines.push("  sections: SidebarSection[];");
  lines.push("}");
  lines.push("");

  lines.push("export const SIDEBAR_CONFIG: SidebarGroup[] = [");
  for (const group of registry.registry_metadata.sidebar_groups) {
    lines.push(`  {`);
    lines.push(`    id: '${escapeString(group.id)}',`);
    lines.push(`    label: '${escapeString(group.label)}',`);
    lines.push(`    sections: [`);
    for (const sectionId of group.sections) {
      const section = sectionMap.get(sectionId);
      if (!section) continue;
      lines.push(`      {`);
      lines.push(`        id: '${escapeString(section.id)}',`);
      lines.push(`        label: '${escapeString(section.label)}',`);
      lines.push(`        icon: '${escapeString(section.icon)}',`);
      lines.push(`        path: '${escapeString(section.path)}',`);
      lines.push(`        subsections: [`);
      for (const sub of section.subsections) {
        const featureIds = sub.features.map((f) => f.id);
        lines.push(`          { id: '${escapeString(sub.id)}', label: '${escapeString(sub.label)}', featureIds: ${formatStringArray(featureIds)} },`);
      }
      lines.push(`        ],`);
      lines.push(`      },`);
    }
    lines.push(`    ],`);
    lines.push(`  },`);
  }
  lines.push("];");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Code generation: feature-index.ts (#329)
// ---------------------------------------------------------------------------

export function generateFeatureIndex(registry: Registry): string {
  const lines: string[] = [];

  lines.push("// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.");
  lines.push("// @generated");
  lines.push("");

  lines.push("export interface FeatureSearchEntry {");
  lines.push("  id: string;");
  lines.push("  label: string;");
  lines.push("  description: string;");
  lines.push("  path: string;");
  lines.push("  section: string;");
  lines.push("  subsection: string;");
  lines.push("  keywords: string[];");
  lines.push("}");
  lines.push("");

  lines.push("export const FEATURE_INDEX: FeatureSearchEntry[] = [");
  for (const section of registry.sections) {
    for (const sub of section.subsections) {
      for (const f of sub.features) {
        const keywords = f.keywords ?? [];
        lines.push(`  { id: '${escapeString(f.id)}', label: '${escapeString(f.label)}', description: '${escapeString(f.description)}', path: '${escapeString(f.path)}', section: '${escapeString(section.label)}', subsection: '${escapeString(sub.label)}', keywords: ${formatStringArray(keywords)} },`);
      }
    }
  }
  lines.push("];");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Code generation: backend route-manifest.ts (#350)
// ---------------------------------------------------------------------------

export function generateBackendManifest(registry: Registry, registryHash: string): string {
  const features = getAllFeatures(registry);
  const lines: string[] = [];

  lines.push("// AUTO-GENERATED — do not edit. Run `pnpm generate:dashboard` to regenerate.");
  lines.push("// @generated");
  lines.push("");
  lines.push(`export const REGISTRY_HASH = '${registryHash}';`);
  lines.push("");

  lines.push("export interface RouteManifestEntry {");
  lines.push("  id: string;");
  lines.push("  path: string;");
  lines.push("  roles: string[];");
  lines.push("  permissions: string[];");
  lines.push("  status: string;");
  lines.push("  phase: string;");
  lines.push("}");
  lines.push("");

  lines.push("export const ROUTE_MANIFEST: RouteManifestEntry[] = [");
  for (const f of features) {
    lines.push(`  { id: '${escapeString(f.id)}', path: '${escapeString(f.path)}', roles: ${formatStringArray(f.roles)}, permissions: ${formatStringArray(f.permissions)}, status: '${escapeString(f.status)}', phase: '${escapeString(f.phase)}' },`);
  }
  lines.push("];");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

function main() {
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const registryPath = path.resolve(
    scriptDir,
    "../../../docs/superpowers/specs/2026-03-15-dashboard-feature-registry.json",
  );

  const webGenDir = path.resolve(scriptDir, "../app/dashboard/_generated");
  const backendGenDir = path.resolve(scriptDir, "../../backend/src/_generated");

  console.log("Reading registry:", registryPath);
  const raw = fs.readFileSync(registryPath, "utf-8");
  const registry = parseRegistry(raw);

  // Validate first (fail fast)
  console.log("Validating registry...");
  const errors = validateRegistry(registry, { expectedFeatureCount: 502 });
  if (errors.length > 0) {
    console.error("Registry validation failed:");
    for (const err of errors) {
      console.error(`  [${err.rule}]${err.featureId ? ` ${err.featureId}:` : ""} ${err.message}`);
    }
    process.exit(1);
  }
  console.log("Validation passed (502 features, 9 rules).");

  // Compute hash
  const registryHash = computeRegistryHash(raw);
  console.log("Registry hash:", registryHash);

  // Generate outputs — remove existing dirs to prevent symlink attacks, then recreate
  for (const dir of [webGenDir, backendGenDir]) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
  }

  function safeWrite(filePath: string, content: string): void {
    // Ensure target is not a symlink
    try {
      const stat = fs.lstatSync(filePath);
      if (stat.isSymbolicLink()) {
        throw new Error(`Refusing to write to symlink: ${filePath}`);
      }
    } catch (e: unknown) {
      // ENOENT is fine — file does not exist yet
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    }
    fs.writeFileSync(filePath, content);
  }

  const routesContent = generateRoutes(registry, registryHash);
  safeWrite(path.join(webGenDir, "routes.ts"), routesContent);
  console.log("Generated:", path.join(webGenDir, "routes.ts"));

  const sidebarContent = generateSidebarConfig(registry);
  safeWrite(path.join(webGenDir, "sidebar-config.ts"), sidebarContent);
  console.log("Generated:", path.join(webGenDir, "sidebar-config.ts"));

  const indexContent = generateFeatureIndex(registry);
  safeWrite(path.join(webGenDir, "feature-index.ts"), indexContent);
  console.log("Generated:", path.join(webGenDir, "feature-index.ts"));

  const manifestContent = generateBackendManifest(registry, registryHash);
  safeWrite(path.join(backendGenDir, "route-manifest.ts"), manifestContent);
  console.log("Generated:", path.join(backendGenDir, "route-manifest.ts"));

  console.log("Dashboard registry code generation complete.");
}

// Run if executed directly
const isMain = process.argv[1] && new URL(import.meta.url).pathname === path.resolve(process.argv[1]);
if (isMain) {
  main();
}
