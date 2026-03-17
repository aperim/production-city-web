/**
 * Workspace resolution — computes visible workspaces, tabs, and feature counts
 * for a given dashboard role and permission set.
 *
 * @see Issue #386
 */

import { WORKSPACE_CONFIG, ROLE_CONFIG } from "../_generated/workspace-manifest.js";
import { ROUTE_MANIFEST } from "../_generated/route-manifest.js";
import { canAccessFeature, resolveUserPermissions } from "./permissions.js";

/** Status of a workspace tab, derived from its primary feature's status. */
export type TabStatus = "active" | "coming_soon" | "planned";

/** A workspace tab as returned by the API. */
export interface VisibleTab {
  id: string;
  label: string;
  canvas: string;
  status: TabStatus;
  featureCount: number;
  activeFeatureCount: number;
}

/** An upcoming feature reference. */
export interface UpcomingFeature {
  id: string;
  label: string;
  status: string;
}

/** A visible workspace as returned by the API. */
export interface VisibleWorkspace {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaultCanvas: string;
  tabs: VisibleTab[];
  totalFeatures: number;
  activeFeatures: number;
  upcomingFeatures: UpcomingFeature[];
}

/** Build a feature lookup map from the route manifest for O(1) access. */
const FEATURE_MAP = new Map(ROUTE_MANIFEST.map((f) => [f.id, f]));

/**
 * Derive tab status from the statuses of its constituent features.
 * - If any feature is "active" → "active"
 * - If any feature is "coming_soon" → "coming_soon"
 * - Otherwise → "planned"
 */
function deriveTabStatus(featureIds: string[]): TabStatus {
  let hasComingSoon = false;
  for (const fid of featureIds) {
    const feature = FEATURE_MAP.get(fid);
    if (!feature) continue;
    if (feature.status === "active") return "active";
    if (feature.status === "coming_soon") hasComingSoon = true;
  }
  return hasComingSoon ? "coming_soon" : "planned";
}

/**
 * Compute visible workspaces for a given dashboard role.
 *
 * Filters workspaces and tabs based on the role's access to constituent features.
 * A tab is visible if the user can access at least one of its features.
 * A workspace is visible if it has at least one visible tab.
 */
export function computeVisibleWorkspaces(
  dashboardRole: string,
  dbPermissions: string[],
): VisibleWorkspace[] {
  const userPermissions = resolveUserPermissions(dashboardRole, dbPermissions);

  // Get workspace order for this role (fall back to default order)
  const roleConfig = (ROLE_CONFIG as unknown as Record<string, { workspaceOrder: readonly string[] }>)[dashboardRole];
  const workspaceOrder: readonly string[] = roleConfig?.workspaceOrder ?? WORKSPACE_CONFIG.map((ws) => ws.id);

  // Build ordered workspace list
  const workspaceMap = new Map(WORKSPACE_CONFIG.map((ws) => [ws.id as string, ws]));
  const orderedWorkspaces = workspaceOrder
    .map((id: string) => workspaceMap.get(id))
    .filter((ws): ws is NonNullable<typeof ws> => ws != null);

  const result: VisibleWorkspace[] = [];

  for (const ws of orderedWorkspaces) {
    // Check role-level access to workspace
    if (dashboardRole !== "admin" && !(ws.roles as readonly string[]).includes(dashboardRole)) {
      continue;
    }

    const visibleTabs: VisibleTab[] = [];
    let totalFeatures = 0;
    let activeFeatures = 0;
    const upcoming: UpcomingFeature[] = [];

    for (const tab of ws.tabs) {
      // Filter to accessible features within this tab
      const accessibleFeatureIds = tab.featureIds.filter((fid) => {
        const feature = FEATURE_MAP.get(fid);
        if (!feature) return false;
        return canAccessFeature(dashboardRole, userPermissions, feature);
      });

      if (accessibleFeatureIds.length === 0) continue;

      const tabActiveCount = accessibleFeatureIds.filter((fid) => {
        const f = FEATURE_MAP.get(fid);
        return f?.status === "active";
      }).length;

      visibleTabs.push({
        id: tab.id,
        label: tab.label,
        canvas: tab.canvas,
        status: deriveTabStatus(accessibleFeatureIds),
        featureCount: accessibleFeatureIds.length,
        activeFeatureCount: tabActiveCount,
      });

      totalFeatures += accessibleFeatureIds.length;
      activeFeatures += tabActiveCount;

      // Collect upcoming features (coming_soon or planned)
      for (const fid of accessibleFeatureIds) {
        const f = FEATURE_MAP.get(fid);
        if (f && (f.status === "coming_soon" || f.status === "planned")) {
          upcoming.push({
            id: f.id,
            label: fid, // Use feature ID as label (feature index has labels, but not in manifest)
            status: f.status,
          });
        }
      }
    }

    if (visibleTabs.length === 0) continue;

    result.push({
      id: ws.id,
      label: ws.label,
      icon: ws.icon,
      description: ws.description,
      defaultCanvas: ws.defaultCanvas,
      tabs: visibleTabs,
      totalFeatures,
      activeFeatures,
      upcomingFeatures: upcoming.slice(0, 10), // Cap at 10 upcoming per workspace
    });
  }

  return result;
}
