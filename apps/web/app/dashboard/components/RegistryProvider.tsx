'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Phase } from '@productioncity/holding-ui';

/** Registry context shape */
export interface RegistryContextValue {
  /** Visible feature IDs for the current user */
  visibleFeatureIds: string[];
  /** Current company lifecycle phase */
  currentPhase: Phase;
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
 * In Phase 1, visibleFeatureIds includes all features the user's role can see
 * (resolved server-side or defaulted to all for scaffold). currentPhase is
 * from the backend environment.
 */
export function RegistryProvider({ visibleFeatureIds, currentPhase, children }: RegistryProviderProps) {
  return (
    <RegistryContext.Provider value={{ visibleFeatureIds, currentPhase }}>
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
