'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Phase } from '@productioncity/holding-ui';
import { WORKSPACE_CONFIG, WORKSPACE_MAP, type WorkspaceId } from '../_generated/workspace-config';

/** Registry context shape */
export interface RegistryContextValue {
  /** Visible feature IDs for the current user */
  visibleFeatureIds: string[];
  /** Current company lifecycle phase */
  currentPhase: Phase;
  /** Visible workspace IDs (workspaces with at least one visible feature) */
  visibleWorkspaceIds: WorkspaceId[];
  /** Check if a workspace is visible to the current user */
  isWorkspaceVisible: (workspaceId: string) => boolean;
  /** Get visible tab IDs for a workspace */
  getVisibleTabIds: (workspaceId: string) => string[];
}

const RegistryContext = createContext<RegistryContextValue | null>(null);

/** Props for the RegistryProvider */
export interface RegistryProviderProps {
  visibleFeatureIds: string[];
  currentPhase: Phase;
  children: ReactNode;
}

/**
 * RegistryProvider — provides filtered registry data to all dashboard children.
 *
 * Computes workspace visibility from the intersection of visible feature IDs
 * and workspace tab feature mappings.
 */
export function RegistryProvider({ visibleFeatureIds, currentPhase, children }: RegistryProviderProps) {
  const value = useMemo<RegistryContextValue>(() => {
    const visibleSet = new Set(visibleFeatureIds);

    // Compute visible workspaces
    const visibleWorkspaceIds: WorkspaceId[] = [];
    for (const ws of WORKSPACE_CONFIG) {
      const hasVisibleFeature = ws.tabs.some((tab) =>
        tab.featureIds.some((fid) => visibleSet.has(fid)),
      );
      if (hasVisibleFeature) {
        visibleWorkspaceIds.push(ws.id);
      }
    }

    const isWorkspaceVisible = (workspaceId: string): boolean => {
      const ws = WORKSPACE_MAP.get(workspaceId as WorkspaceId);
      if (!ws) return false;
      return ws.tabs.some((tab) =>
        tab.featureIds.some((fid) => visibleSet.has(fid)),
      );
    };

    const getVisibleTabIds = (workspaceId: string): string[] => {
      const ws = WORKSPACE_MAP.get(workspaceId as WorkspaceId);
      if (!ws) return [];
      return ws.tabs
        .filter((tab) => tab.featureIds.some((fid) => visibleSet.has(fid)))
        .map((tab) => tab.id);
    };

    return {
      visibleFeatureIds,
      currentPhase,
      visibleWorkspaceIds,
      isWorkspaceVisible,
      getVisibleTabIds,
    };
  }, [visibleFeatureIds, currentPhase]);

  return (
    <RegistryContext.Provider value={value}>
      {children}
    </RegistryContext.Provider>
  );
}

/**
 * Hook to access registry context.
 * Must be used within a RegistryProvider.
 */
export function useRegistry(): RegistryContextValue {
  const ctx = useContext(RegistryContext);
  if (!ctx) {
    throw new Error('useRegistry must be used within a RegistryProvider');
  }
  return ctx;
}
