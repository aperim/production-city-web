'use client';

/**
 * Workspace tab page — renders the FeatureGate for features in the tab.
 *
 * URL: /dashboard/{workspace}/{tab}
 * Anti-enumeration: returns null (404) for unauthorized workspaces/tabs.
 *
 * @see Issue #385
 */

import { useMemo } from 'react';
import { useRegistry } from '../../components/RegistryProvider';
import { FeatureGate } from '../../components/FeatureGate';
import { WORKSPACE_MAP, type WorkspaceId } from '../../_generated/workspace-config';

/** Extract workspace and tab slugs from the URL path. */
function useWorkspaceTabParams(): { workspace: string; tab: string } {
  return useMemo(() => {
    if (typeof window === 'undefined') return { workspace: '', tab: '' };
    // URL: /dashboard/{workspace}/{tab}
    const segments = window.location.pathname.split('/').filter(Boolean);
    const dashIdx = segments.indexOf('dashboard');
    return {
      workspace: segments[dashIdx + 1] ?? '',
      tab: segments[dashIdx + 2] ?? '',
    };
  }, []);
}

export default function WorkspaceTabPage() {
  const { workspace: workspaceId, tab: tabId } = useWorkspaceTabParams();
  const { visibleFeatureIds, isWorkspaceVisible } = useRegistry();

  // Anti-enumeration: workspace must exist and be visible
  const ws = WORKSPACE_MAP.get(workspaceId as WorkspaceId);
  if (!ws || !isWorkspaceVisible(workspaceId)) {
    return null; // 404
  }

  // Find the tab
  const tab = ws.tabs.find((t) => t.id === tabId);
  if (!tab) {
    return null; // 404 — tab doesn't exist
  }

  // Check if user has visibility to any feature in this tab
  const visibleSet = new Set(visibleFeatureIds);
  const visibleTabFeatures = tab.featureIds.filter((fid) => visibleSet.has(fid));
  if (visibleTabFeatures.length === 0) {
    return null; // 404 — anti-enumeration
  }

  // Render FeatureGate for the primary feature (first in the tab)
  const primaryFeatureId = visibleTabFeatures[0]!;

  return (
    <div data-workspace={workspaceId} data-tab={tabId}>
      <FeatureGate
        featureId={primaryFeatureId}
        visibleFeatureIds={visibleFeatureIds}
      />
    </div>
  );
}
