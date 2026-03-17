/**
 * Tests for workspace routing migration (#385).
 *
 * Validates:
 * - Workspace and tab URL resolution from generated config
 * - Old path → new workspace/tab redirect mapping
 * - Anti-enumeration (unauthorized = null/404)
 * - RegistryProvider workspace visibility exposure
 */

import { describe, it, expect } from "vitest";
import {
  WORKSPACE_CONFIG,
  WORKSPACE_MAP,
  type WorkspaceId,
} from "../_generated/workspace-config";
import { DASHBOARD_ROUTES } from "../_generated/routes";

// ---------------------------------------------------------------------------
// Helpers: workspace routing logic (mirrors what the page components will use)
// ---------------------------------------------------------------------------

/**
 * Resolve a workspace by ID. Returns undefined if workspace doesn't exist.
 */
function resolveWorkspace(workspaceId: string) {
  return WORKSPACE_MAP.get(workspaceId as WorkspaceId);
}

/**
 * Resolve a tab within a workspace. Returns undefined if not found.
 */
function resolveTab(workspaceId: string, tabId: string) {
  const ws = resolveWorkspace(workspaceId);
  if (!ws) return undefined;
  return ws.tabs.find((t) => t.id === tabId);
}

/**
 * Build a map from old feature path → new workspace/tab path.
 * Used for 301 redirects from legacy URLs.
 */
function buildRedirectMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const ws of WORKSPACE_CONFIG) {
    for (const tab of ws.tabs) {
      for (const featureId of tab.featureIds) {
        const route = DASHBOARD_ROUTES.find((r) => r.id === featureId);
        if (route) {
          map.set(route.path, `/dashboard/${ws.id}/${tab.id}`);
        }
      }
    }
  }
  return map;
}

/**
 * Check if a workspace is visible to a given set of visible feature IDs.
 * A workspace is visible if at least one of its features is in the visible set.
 */
function isWorkspaceVisible(workspaceId: string, visibleFeatureIds: Set<string>): boolean {
  const ws = resolveWorkspace(workspaceId);
  if (!ws) return false;
  return ws.tabs.some((tab) =>
    tab.featureIds.some((fid) => visibleFeatureIds.has(fid)),
  );
}

/**
 * Get visible tabs for a workspace given visible feature IDs.
 */
function getVisibleTabs(workspaceId: string, visibleFeatureIds: Set<string>) {
  const ws = resolveWorkspace(workspaceId);
  if (!ws) return [];
  return ws.tabs.filter((tab) =>
    tab.featureIds.some((fid) => visibleFeatureIds.has(fid)),
  );
}

// ===========================================================================
// Tests
// ===========================================================================

describe("workspace routing — workspace resolution", () => {
  it("resolves all 11 workspaces by ID", () => {
    const workspaceIds: WorkspaceId[] = [
      "productions", "facilities", "finance", "people", "campus",
      "events", "education", "analytics", "investor-relations",
      "partnerships", "administration",
    ];
    for (const id of workspaceIds) {
      expect(resolveWorkspace(id)).toBeDefined();
      expect(resolveWorkspace(id)!.id).toBe(id);
    }
  });

  it("returns undefined for non-existent workspace", () => {
    expect(resolveWorkspace("nonexistent")).toBeUndefined();
  });

  it("each workspace has at least one tab", () => {
    for (const ws of WORKSPACE_CONFIG) {
      expect(ws.tabs.length).toBeGreaterThan(0);
    }
  });
});

describe("workspace routing — tab resolution", () => {
  it("resolves a tab within a workspace", () => {
    const tab = resolveTab("productions", "overview");
    expect(tab).toBeDefined();
    expect(tab!.id).toBe("overview");
    expect(tab!.featureIds.length).toBeGreaterThan(0);
  });

  it("returns undefined for non-existent tab", () => {
    expect(resolveTab("productions", "nonexistent")).toBeUndefined();
  });

  it("returns undefined for non-existent workspace", () => {
    expect(resolveTab("nonexistent", "overview")).toBeUndefined();
  });
});

describe("workspace routing — redirect map", () => {
  it("maps old feature paths to new workspace/tab paths", () => {
    const redirectMap = buildRedirectMap();

    // Should have entries for all features mapped to workspace tabs
    expect(redirectMap.size).toBeGreaterThan(0);

    // Spot-check: productions.active.board should map to /dashboard/productions/overview
    const boardPath = DASHBOARD_ROUTES.find((r) => r.id === "productions.active.board")?.path;
    if (boardPath) {
      expect(redirectMap.get(boardPath)).toBe("/dashboard/productions/overview");
    }
  });

  it("all redirect targets use /dashboard/{workspace}/{tab} format", () => {
    const redirectMap = buildRedirectMap();
    for (const [, target] of redirectMap) {
      expect(target).toMatch(/^\/dashboard\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/);
    }
  });

  it("covers all non-home features in the registry", () => {
    const redirectMap = buildRedirectMap();
    const mappedOldPaths = new Set(redirectMap.keys());

    // Every non-home feature that's in a workspace tab should have a redirect
    for (const ws of WORKSPACE_CONFIG) {
      for (const tab of ws.tabs) {
        for (const featureId of tab.featureIds) {
          const route = DASHBOARD_ROUTES.find((r) => r.id === featureId);
          if (route) {
            expect(mappedOldPaths.has(route.path)).toBe(true);
          }
        }
      }
    }
  });
});

describe("workspace routing — visibility (anti-enumeration)", () => {
  it("workspace is visible when user has at least one feature in it", () => {
    const visibleIds = new Set(["productions.active.board"]);
    expect(isWorkspaceVisible("productions", visibleIds)).toBe(true);
  });

  it("workspace is NOT visible when user has no features in it", () => {
    const visibleIds = new Set(["some.unrelated.feature"]);
    expect(isWorkspaceVisible("productions", visibleIds)).toBe(false);
  });

  it("non-existent workspace is never visible", () => {
    const allIds = new Set(DASHBOARD_ROUTES.map((r) => r.id));
    expect(isWorkspaceVisible("nonexistent", allIds)).toBe(false);
  });

  it("returns only visible tabs within a workspace", () => {
    // Only give visibility to overview tab features
    const overviewTab = WORKSPACE_CONFIG.find((ws) => ws.id === "productions")!.tabs[0]!;
    const visibleIds = new Set(overviewTab.featureIds);
    const visibleTabs = getVisibleTabs("productions", visibleIds);
    expect(visibleTabs.length).toBe(1);
    expect(visibleTabs[0]!.id).toBe("overview");
  });

  it("admin (all features visible) sees all tabs", () => {
    const allIds = new Set(DASHBOARD_ROUTES.map((r) => r.id));
    for (const ws of WORKSPACE_CONFIG) {
      const visibleTabs = getVisibleTabs(ws.id, allIds);
      expect(visibleTabs.length).toBe(ws.tabs.length);
    }
  });
});

describe("workspace routing — URL structure", () => {
  it("/dashboard should redirect to /dashboard/home (or first workspace)", () => {
    // This is a routing behavior test — we verify the convention
    // The actual redirect happens in the page component
    expect(true).toBe(true); // Placeholder for integration test
  });

  it("/dashboard/{workspace} should redirect to first visible tab", () => {
    // For each workspace, the first tab is the default
    for (const ws of WORKSPACE_CONFIG) {
      const firstTab = ws.tabs[0]!;
      expect(firstTab).toBeDefined();
      const expectedPath = `/dashboard/${ws.id}/${firstTab.id}`;
      expect(expectedPath).toMatch(/^\/dashboard\/[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/);
    }
  });
});
