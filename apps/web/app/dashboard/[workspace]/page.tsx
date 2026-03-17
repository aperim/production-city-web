'use client';

/**
 * Workspace index page — redirects to the first visible tab.
 *
 * URL: /dashboard/{workspace}
 * Behavior: redirects to /dashboard/{workspace}/{firstVisibleTab}
 * Anti-enumeration: returns null (404) for unauthorized workspaces.
 *
 * @see Issue #385
 */

import { useEffect, useMemo } from 'react';
import { useRegistry } from '../components/RegistryProvider';
import { WORKSPACE_MAP, type WorkspaceId } from '../_generated/workspace-config';

/** Extract the workspace slug from the URL path. */
function useWorkspaceParam(): string {
  return useMemo(() => {
    if (typeof window === 'undefined') return '';
    // URL: /dashboard/{workspace}
    const segments = window.location.pathname.split('/').filter(Boolean);
    const dashIdx = segments.indexOf('dashboard');
    return segments[dashIdx + 1] ?? '';
  }, []);
}

export default function WorkspacePage() {
  const workspaceId = useWorkspaceParam();
  const { isWorkspaceVisible, getVisibleTabIds } = useRegistry();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Anti-enumeration: workspace must exist and be visible
    const ws = WORKSPACE_MAP.get(workspaceId as WorkspaceId);
    if (!ws || !isWorkspaceVisible(workspaceId)) return;

    // Redirect to first visible tab
    const visibleTabs = getVisibleTabIds(workspaceId);
    if (visibleTabs.length > 0) {
      window.location.replace(`/dashboard/${workspaceId}/${visibleTabs[0]}`);
    }
  }, [workspaceId, isWorkspaceVisible, getVisibleTabIds]);

  // Check workspace exists and is visible
  const ws = WORKSPACE_MAP.get(workspaceId as WorkspaceId);
  if (!ws || !isWorkspaceVisible(workspaceId)) {
    return null; // 404 — anti-enumeration
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Loading workspace...
    </div>
  );
}
