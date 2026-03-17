'use client';

/**
 * Catch-all route for deep links within workspace tabs.
 *
 * Handles:
 *   /dashboard/{workspace}/{tab}/new           → Editor (create)
 *   /dashboard/{workspace}/{tab}/{id}          → Preview
 *   /dashboard/{workspace}/{tab}/{id}/edit     → Editor (edit)
 *
 * Currently only the communications tab uses deep routes.
 * Other tabs fall through to 404 (null).
 *
 * @see Issues #442, #443, #444
 */

import { useMemo, useCallback } from 'react';
import { useRegistry } from '../../../components/RegistryProvider';
import {
  WORKSPACE_MAP,
  type WorkspaceId,
} from '../../../_generated/workspace-config';
import {
  AnnouncementEditorCanvas,
  AnnouncementPreviewCanvas,
} from '@productioncity/holding-ui';

/** Extract workspace, tab, and slug segments from the URL path. */
function useDeepRouteParams(): { workspace: string; tab: string; slug: string[] } {
  return useMemo(() => {
    if (typeof window === 'undefined') return { workspace: '', tab: '', slug: [] };
    const segments = window.location.pathname.split('/').filter(Boolean);
    const dashIdx = segments.indexOf('dashboard');
    return {
      workspace: segments[dashIdx + 1] ?? '',
      tab: segments[dashIdx + 2] ?? '',
      slug: segments.slice(dashIdx + 3),
    };
  }, []);
}

/** Permission check stub — returns true in Phase 1 scaffold. */
function useHasPermission() {
  return useCallback((_permission: string) => true, []);
}

export default function WorkspaceTabSlugPage() {
  const { workspace: workspaceId, tab: tabId, slug } = useDeepRouteParams();
  const { visibleFeatureIds, isWorkspaceVisible } = useRegistry();
  const hasPermission = useHasPermission();

  // Anti-enumeration: workspace must exist and be visible
  const ws = WORKSPACE_MAP.get(workspaceId as WorkspaceId);
  if (!ws || !isWorkspaceVisible(workspaceId)) {
    return null; // 404
  }

  // Find the tab
  const tab = ws.tabs.find((t) => t.id === tabId);
  if (!tab) {
    return null; // 404
  }

  // Anti-enumeration: user must have visibility to at least one feature in this tab
  const visibleSet = new Set(visibleFeatureIds);
  const visibleTabFeatures = tab.featureIds.filter((fid) => visibleSet.has(fid));
  if (visibleTabFeatures.length === 0) {
    return null; // 404 — anti-enumeration
  }

  // Route deep links for communications tab
  if (tabId === 'communications') {
    return renderCommunicationsDeepRoute(slug, workspaceId, hasPermission);
  }

  // Other tabs don't have deep routes yet
  return null;
}

function renderCommunicationsDeepRoute(
  slug: string[],
  workspaceId: string,
  hasPermission: (p: string) => boolean,
) {
  const basePath = `/dashboard/${workspaceId}/communications`;

  // /new → Create mode
  if (slug.length === 1 && slug[0] === 'new') {
    return (
      <AnnouncementEditorCanvas
        categories={[]}
        tags={[]}
        onSave={() => {}}
        onPublish={() => {}}
        onCancel={() => {
          if (typeof window !== 'undefined') window.location.href = basePath;
        }}
      />
    );
  }

  // /{id}/edit → Edit mode
  if (slug.length === 2 && slug[1] === 'edit') {
    const announcementId = slug[0]!;
    return (
      <AnnouncementEditorCanvas
        announcementId={announcementId}
        categories={[]}
        tags={[]}
        onSave={() => {}}
        onPublish={() => {}}
        onCancel={() => {
          if (typeof window !== 'undefined') window.location.href = `${basePath}/${announcementId}`;
        }}
      />
    );
  }

  // /{id} → Preview mode
  if (slug.length === 1 && slug[0] !== 'new') {
    const announcementId = slug[0]!;
    return (
      <AnnouncementPreviewCanvas
        announcement={{
          id: announcementId,
          title: 'Loading...',
          summary: '',
          contentBlocks: [],
          categories: [],
          tags: [],
          status: 'draft',
          visibility: 'public',
          author: { name: '' },
          publishedAt: new Date().toISOString(),
          lastEditedAt: null,
        }}
        onEdit={() => {
          if (typeof window !== 'undefined') window.location.href = `${basePath}/${announcementId}/edit`;
        }}
        onPublish={() => {}}
        onUnpublish={() => {}}
        onArchive={() => {}}
        hasPermission={hasPermission}
        loading={true}
      />
    );
  }

  return null; // 404 for unknown deep routes
}
