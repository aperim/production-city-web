"use client";

import { useMemo } from "react";
import { useRegistry } from "../components/RegistryProvider";

/** Non-workspace dashboard paths that should return null context */
const NON_WORKSPACE_PATHS = new Set(["home", "inbox", "profile", "settings"]);

export interface AIContext {
  /** Current workspace ID, or null if not in a workspace */
  workspace: string | null;
  /** Current tab ID, or null if not on a tab */
  tab: string | null;
  /** Visible workspace IDs for the current user */
  visibleWorkspaceIds: string[];
  /** Format context for the POST /v1/ai/chat API */
  toAPIContext: () => {
    workspace: string | null;
    tab: string | null;
    visibleWorkspaceIds: string[];
  };
}

/**
 * Parse workspace and tab from a dashboard path.
 * Expected format: /dashboard/{workspace}/{tab}
 */
function parseDashboardPath(pathname: string): { workspace: string | null; tab: string | null } {
  const segments = pathname.replace(/^\/dashboard\/?/, "").split("/").filter(Boolean);
  const first = segments[0];

  if (!first || NON_WORKSPACE_PATHS.has(first)) {
    return { workspace: null, tab: null };
  }

  return {
    workspace: first,
    tab: segments[1] ?? null,
  };
}

/**
 * useAIContext — provides AI-relevant context from the current workspace/tab.
 *
 * Reads the URL path and registry to determine what workspace and tab
 * the user is viewing, plus the set of workspaces visible to them.
 * The toAPIContext() helper formats this for the POST /v1/ai/chat endpoint.
 */
export function useAIContext(): AIContext {
  const registry = useRegistry();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/dashboard";

  return useMemo(() => {
    const { workspace, tab } = parseDashboardPath(pathname);

    // Validate workspace is in the user's visible set
    const validWorkspace = workspace && registry.visibleWorkspaceIds.includes(workspace as never)
      ? workspace
      : workspace && !NON_WORKSPACE_PATHS.has(workspace)
        ? workspace // Still return workspace even if not in visible set — backend validates
        : null;

    const visibleWorkspaceIds = [...registry.visibleWorkspaceIds];

    return {
      workspace: validWorkspace,
      tab: validWorkspace ? tab : null,
      visibleWorkspaceIds,
      toAPIContext() {
        return {
          workspace: this.workspace,
          tab: this.tab,
          visibleWorkspaceIds: this.visibleWorkspaceIds,
        };
      },
    };
  }, [pathname, registry.visibleWorkspaceIds]);
}
