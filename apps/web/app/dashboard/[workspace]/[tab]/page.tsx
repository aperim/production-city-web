'use client';

/**
 * Workspace tab page — resolves the correct canvas component for the tab,
 * renders ComingSoonScaffold for inactive features, and wires ScopeBar.
 *
 * URL: /dashboard/{workspace}/{tab}
 * Anti-enumeration: returns null (404) for unauthorized workspaces/tabs.
 *
 * @see Issue #385 (original FeatureGate)
 * @see Issue #415 (canvas slot rendering + sample data)
 */

import { useMemo, useState, type ReactNode } from 'react';
import { useRegistry } from '../../components/RegistryProvider';
import {
  WORKSPACE_MAP,
  type WorkspaceId,
  type WorkspaceTab,
} from '../../_generated/workspace-config';
import {
  CanvasTable,
  CanvasBoard,
  CanvasCalendar,
  CanvasTimeline,
  CanvasCatalog,
  CanvasDocuments,
  CanvasCharts,
  UsersCanvas,
  SecurityCanvas,
  EoiCanvas,
  ScopeBar,
  type BoardCard,
  type DataTableColumn,
} from '@productioncity/holding-ui';
import { getSampleData } from '../sample-data';
import { WORKSPACE_SCOPE_CONFIGS } from '../../config/workspace-scope-configs';

/**
 * Custom canvas identifiers — workspace/tab combinations that render
 * a dedicated canvas organism instead of a generic canvas type.
 */
const CUSTOM_CANVAS_MAP: Record<string, string> = {
  'administration/users': 'users-canvas',
  'administration/security': 'security-canvas',
  'partnerships/eoi': 'eoi-canvas',
};

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

/** Transform simplified column definitions into DataTableColumn format. */
function toTableColumns(
  simplified: Array<{ key: string; label: string; sortable?: boolean }>,
): DataTableColumn<Record<string, unknown> & { id: string | number }>[] {
  return simplified.map((col) => ({
    id: col.key,
    header: col.label,
    accessor: col.key as keyof (Record<string, unknown> & { id: string | number }),
    sortable: col.sortable,
  }));
}

/** Resolve the correct canvas component for a tab using sample data. */
function resolveCanvas(
  workspace: string,
  tab: WorkspaceTab,
): ReactNode {
  const sampleData = getSampleData(workspace, tab);

  switch (tab.canvas) {
    case 'table':
      return (
        <CanvasTable
          columns={toTableColumns((sampleData.columns as Array<{ key: string; label: string; sortable?: boolean }>) ?? [])}
          data={(sampleData.data as Array<{ id: string; [key: string]: unknown }>) ?? []}
          caption={tab.label}
        />
      );

    case 'board':
      return (
        <CanvasBoard
          lanes={(sampleData.lanes as Array<{ id: string; label: string }>) ?? []}
          cards={(sampleData.cards as BoardCard[]) ?? []}
          onCardMove={() => {}}
        />
      );

    case 'calendar':
      return (
        <CanvasCalendar
          view="month"
          date={new Date()}
          events={(sampleData.events as Array<{ id: string; title: string; start: string; end: string }>) ?? []}
          onViewChange={() => {}}
          onDateChange={() => {}}
        />
      );

    case 'timeline':
      return (
        <CanvasTimeline
          tasks={(sampleData.tasks as Array<{ id: string; title: string; start: string; end: string }>) ?? []}
          zoom="month"
          startDate="2026-01-01"
          endDate="2026-12-31"
        />
      );

    case 'catalog':
      return (
        <CanvasCatalog
          items={(sampleData.items as Array<{ id: string; title: string }>) ?? []}
          categories={(sampleData.categories as string[]) ?? []}
        />
      );

    case 'documents':
      return (
        <CanvasDocuments
          items={(sampleData.items as Array<{ id: string; name: string; type: 'file' | 'folder' }>) ?? []}
          currentPath="/"
        />
      );

    case 'charts':
      return (
        <CanvasCharts
          charts={(sampleData.charts as Array<{ id: string; title: string; type: 'line' | 'bar' | 'area' | 'pie'; data: Array<{ name: string; value: number }> }>) ?? []}
        />
      );

    default:
      return (
        <div className="p-4 text-muted-foreground text-sm">
          Unknown canvas type: {tab.canvas}
        </div>
      );
  }
}

/** Read ?view= query param for sub-view routing. */
function useViewParam(): string | null {
  return useMemo(() => {
    if (typeof window === 'undefined') return null;
    return new URLSearchParams(window.location.search).get('view');
  }, []);
}

/**
 * Resolve a custom canvas for specific workspace/tab combinations.
 * Returns null if the combination doesn't have a custom canvas.
 */
function resolveCustomCanvas(
  workspaceId: string,
  tabId: string,
  viewParam: string | null,
): ReactNode | null {
  const key = `${workspaceId}/${tabId}`;
  const canvasType = CUSTOM_CANVAS_MAP[key];

  if (!canvasType) return null;

  switch (canvasType) {
    case 'users-canvas':
      return (
        <UsersCanvas
          users={[]}
          usersPagination={{ page: 1, totalPages: 0, pageSize: 25 }}
          onUsersPageChange={() => {}}
          onUsersSearch={() => {}}
          onUsersFilter={() => {}}
          onUsersSort={() => {}}
          onUserClick={() => {}}
          invitations={[]}
          onInvitationResend={() => {}}
          onInvitationRevoke={() => {}}
          approvals={[]}
          onApprove={() => {}}
          onReject={() => {}}
          permissions={{ userRead: true, invitationRead: true, userUpdate: true }}
          initialView={
            viewParam === 'invitations' || viewParam === 'approvals'
              ? viewParam
              : undefined
          }
          onViewChange={(view) => {
            const url = new URL(window.location.href);
            if (view === 'users') {
              url.searchParams.delete('view');
            } else {
              url.searchParams.set('view', view);
            }
            window.history.pushState({}, '', url.toString());
          }}
        />
      );

    case 'security-canvas':
      return (
        <SecurityCanvas
          entries={[]}
          hasPermission={true}
          hasMore={false}
          onLoadMore={() => {}}
          onFilterChange={() => {}}
        />
      );

    case 'eoi-canvas':
      return (
        <EoiCanvas
          items={[]}
          pagination={{ page: 1, totalPages: 0, total: 0, limit: 25 }}
          onPageChange={() => {}}
          onSearch={() => {}}
          onCategoryFilter={() => {}}
          onStatusFilter={() => {}}
          hasPermission={true}
        />
      );

    default:
      return null;
  }
}

export default function WorkspaceTabPage() {
  const { workspace: workspaceId, tab: tabId } = useWorkspaceTabParams();
  const viewParam = useViewParam();
  const { visibleFeatureIds, isWorkspaceVisible } = useRegistry();
  const [scopeValue, setScopeValue] = useState<string>('all');

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

  // Scope bar config for this workspace
  const scopeConfig = WORKSPACE_SCOPE_CONFIGS[workspaceId];

  // Check for custom canvas first, then fall back to generic canvas
  const customCanvas = resolveCustomCanvas(workspaceId, tabId, viewParam);
  const canvas = customCanvas ?? resolveCanvas(workspaceId, tab);

  return (
    <div data-workspace={workspaceId} data-tab={tabId} className="flex flex-col h-full">
      {/* Scope bar — hidden for custom canvases (they have their own controls) */}
      {scopeConfig && !customCanvas && (
        <ScopeBar
          options={scopeConfig.options}
          value={scopeValue}
          onChange={setScopeValue}
          searchPlaceholder={scopeConfig.searchPlaceholder}
          onSearch={() => {}}
        />
      )}

      {/* Canvas content */}
      <div className="flex-1 overflow-y-auto">
        {canvas}
      </div>
    </div>
  );
}
