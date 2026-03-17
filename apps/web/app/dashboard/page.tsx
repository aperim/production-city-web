"use client";

/**
 * Dashboard home — workspace-oriented landing page (Phase 2).
 *
 * Renders HomeDashboard with workspace cards, attention items,
 * recents, and what's new sections.
 *
 * @see Issue #394 (HomeDashboard template)
 * @see Issue #436 (Phase 2 workspace-based UI)
 */

import { useCallback, useMemo } from "react";
import {
  HomeDashboard,
  type WorkspaceCardProps,
} from "@productioncity/holding-ui";
import { useRegistry } from "./components/RegistryProvider";
import { WORKSPACE_CONFIG } from "./_generated/workspace-config";

export default function DashboardPage() {
  const { visibleWorkspaceIds, getVisibleTabIds } = useRegistry();

  const handleNavigate = useCallback((path: string) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  }, []);

  /** Build workspace cards from visible workspaces */
  const workspaceCards: WorkspaceCardProps[] = useMemo(() => {
    const visibleSet = new Set(visibleWorkspaceIds);
    return WORKSPACE_CONFIG
      .filter((ws) => visibleSet.has(ws.id))
      .map((ws) => {
        const visibleTabIds = getVisibleTabIds(ws.id);
        const activeTabs = ws.tabs.filter((t) => visibleTabIds.includes(t.id));
        const upcomingTabs = ws.tabs.filter((t) => !visibleTabIds.includes(t.id));

        return {
          workspace: {
            id: ws.id,
            label: ws.label,
            icon: ws.icon,
            description: ws.description,
          },
          stats: [
            { label: "tabs", value: String(activeTabs.length) },
          ],
          activeFeatureCount: activeTabs.reduce((sum, t) => sum + t.featureIds.length, 0),
          upcomingFeatureCount: upcomingTabs.reduce((sum, t) => sum + t.featureIds.length, 0),
          tabs: ws.tabs.map((t) => ({
            id: t.id,
            label: t.label,
            status: visibleTabIds.includes(t.id) ? "active" as const : "coming_soon" as const,
          })),
          onNavigate: handleNavigate,
        };
      });
  }, [visibleWorkspaceIds, getVisibleTabIds, handleNavigate]);

  return (
    <HomeDashboard
      attentionItems={[]}
      recents={[]}
      workspaceCards={workspaceCards}
      whatsNew={[]}
      onNavigate={handleNavigate}
      onRecentClick={handleNavigate}
    />
  );
}
