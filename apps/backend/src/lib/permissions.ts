/**
 * Dashboard permission resolution.
 *
 * Implements the permission model from the dashboard scaffold design spec:
 * - Wildcard matching: 'hr:*' matches 'hr:read', 'hr:admin'
 * - Self-scoping: 'hr:read:self' matches 'hr:read' (data filtering is API-layer)
 * - Admin bypass: users with '*' permission see all features
 *
 * The dashboard defines 10 conceptual roles (admin, executive, staff, etc.)
 * Each feature in the manifest has a `roles` array listing which dashboard roles
 * can see it. We map the user's effective dashboard role from their permissions:
 * - If user has '*' permission → admin
 * - If user has 'dashboard:executive' → executive
 * - etc.
 */

import { ROUTE_MANIFEST, REGISTRY_HASH, type RouteManifestEntry } from "../_generated/route-manifest.js";

/** Dashboard role names in priority order (first match wins). */
const DASHBOARD_ROLES = [
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

/** Role → base permission grants (from design spec). */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin:        ["*"],
  executive:    ["dashboard:executive", "hr:read", "legal:read", "company_finance:*",
                 "productions:read", "facilities:read", "analytics:*", "investor:*"],
  staff:        ["dashboard:staff", "hr:read:self", "productions:read", "facilities:book",
                 "workflow:read", "talent:read:self"],
  client:       ["dashboard:client", "productions:read:own", "facilities:book",
                 "workflow:review", "finance:invoices:own"],
  vendor:       ["dashboard:vendor", "vendors:read:self", "finance:invoices:own"],
  investor:     ["dashboard:investor", "investor:read", "data_rooms:investor"],
  guest:        ["dashboard:guest", "events:browse", "education:browse"],
  government:   ["dashboard:government", "gov_policy:read", "data_rooms:government",
                 "analytics:economic_impact"],
  partner:      ["dashboard:partner", "partnerships:read:own", "data_rooms:partner",
                 "education:collaborate"],
  first_nations: ["dashboard:first_nations", "first_nations:*", "community:read"],
};

/**
 * Wildcard + self-scope permission matching.
 * 'hr:*' matches 'hr:read', 'hr:admin', etc.
 * 'hr:read:self' matches 'hr:read' (self is a data-scope modifier, not a permission gate).
 */
export function matchPermission(granted: string, required: string): boolean {
  // Strip :self and :own suffixes from granted — these are data-scope modifiers,
  // not permission restrictions
  const normalised = granted.replace(/:(?:self|own)$/, "");
  const grantedParts = normalised.split(":");
  const requiredParts = required.split(":");

  for (let i = 0; i < requiredParts.length; i++) {
    if (grantedParts[i] === "*") return true;
    if (grantedParts[i] !== requiredParts[i]) return false;
  }
  return true;
}

/**
 * Determine the user's dashboard role from their effective permission set.
 * Returns the best matching dashboard role, or "guest" as fallback.
 *
 * Detection: if user has the 'dashboard:{role}' permission (or '*'), they map
 * to that dashboard role.
 */
export function resolveDashboardRole(userPermissions: string[]): string {
  // Check for global wildcard first (catches admin with '*' permission)
  if (userPermissions.some((p) => p === "*")) return "admin";

  // Check for dashboard:{role} marker permissions
  for (const role of DASHBOARD_ROLES) {
    const marker = `dashboard:${role}`;
    if (userPermissions.some((p) => matchPermission(p, marker))) {
      return role;
    }
  }

  return "guest";
}

/**
 * Resolve which permissions a user has based on their dashboard role name
 * plus any additional permissions from the database.
 */
export function resolveUserPermissions(dashboardRole: string, dbPermissions: string[]): string[] {
  const base = ROLE_PERMISSIONS[dashboardRole] ?? [];
  return [...new Set([...base, ...dbPermissions])];
}

/**
 * Check if a user can access a specific feature.
 */
export function canAccessFeature(
  dashboardRole: string,
  userPermissions: string[],
  feature: RouteManifestEntry,
): boolean {
  // Admin bypasses all checks
  if (dashboardRole === "admin") return true;

  // Check role inclusion
  if (!feature.roles.includes(dashboardRole)) return false;

  // Check all required permissions
  return feature.permissions.every((requiredPerm) =>
    userPermissions.some((userPerm) => matchPermission(userPerm, requiredPerm)),
  );
}

/**
 * Compute the full list of visible feature IDs for a user.
 * @param dashboardRole - The user's resolved dashboard role
 * @param dbPermissions - Permissions loaded from the database (resource:action pairs)
 */
export function computeVisibleFeatures(
  dashboardRole: string,
  dbPermissions: string[],
): string[] {
  const userPermissions = resolveUserPermissions(dashboardRole, dbPermissions);

  return ROUTE_MANIFEST
    .filter((feature) => canAccessFeature(dashboardRole, userPermissions, feature))
    .map((feature) => feature.id);
}

/** Re-export registry hash for use in API responses. */
export { REGISTRY_HASH };

/** Feature ID lookup set built from route manifest. */
const VALID_FEATURE_IDS = new Set(ROUTE_MANIFEST.map((f) => f.id));

/** Check if a featureId exists in the registry. */
export function isValidFeatureId(featureId: string): boolean {
  return VALID_FEATURE_IDS.has(featureId);
}
