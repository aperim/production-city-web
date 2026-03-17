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

import { useEffect } from 'react';
import { useParams } from 'vinext/client';
import { useRegistry } from '../components/RegistryProvider';
import { WORKSPACE_MAP, type WorkspaceId } from '../_generated/workspace-config';

export default function WorkspacePage() {
  const params = useParams<{ workspace: string }>();
  const workspaceId = params.workspace;
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
