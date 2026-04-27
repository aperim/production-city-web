"use client";

import { useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { PlannedFeatureCard } from '../../molecules/PlannedFeatureCard/PlannedFeatureCard';

export interface PlannedFeature {
  featureId: string;
  label: string;
  description: string;
  status: 'coming_soon' | 'planned';
  targetQuarter?: string | null;
  onNotify: (featureId: string) => void;
}

export interface PlannedSectionProps {
  /** Workspace ID for localStorage key */
  workspaceId: string;
  /** List of planned/coming-soon features */
  features: PlannedFeature[];
  /** Additional class names */
  className?: string;
}

const MAX_VISIBLE = 6;

function getStorageKey(workspaceId: string) {
  return `pc-planned-expanded-${workspaceId}`;
}

function readInitialState(workspaceId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(getStorageKey(workspaceId)) === 'true';
  } catch {
    return false;
  }
}

/**
 * PlannedSection organism — collapsible section showing planned features.
 *
 * Collapsed by default with "N planned features" link. Expands to
 * horizontal scroll of PlannedFeatureCards. Max 6 visible with "+N more"
 * overflow. Collapse state persisted per workspace to localStorage.
 * Hidden when zero features.
 */
export function PlannedSection({
  workspaceId,
  features,
  className,
}: PlannedSectionProps) {
  const [expanded, setExpanded] = useState(() => readInitialState(workspaceId));

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(getStorageKey(workspaceId), String(next));
      } catch {
        // storage unavailable
      }
      return next;
    });
  }, [workspaceId]);

  if (features.length === 0) return null;

  const visibleFeatures = features.slice(0, MAX_VISIBLE);
  const overflow = features.length - MAX_VISIBLE;
  const panelId = `planned-panel-${workspaceId}`;

  return (
    <section className={cn('border-t border-border', className)}>
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={cn(
            'shrink-0 transition-transform duration-150',
            expanded && 'rotate-90',
          )}
          aria-hidden="true"
        >
          <path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{features.length} planned features</span>
      </button>
      {expanded && (
        <div id={panelId} role="region" aria-label="Planned features" className="flex gap-3 overflow-x-auto px-4 pb-4">
          {visibleFeatures.map((f) => (
            <PlannedFeatureCard
              key={f.featureId}
              featureId={f.featureId}
              label={f.label}
              description={f.description}
              status={f.status}
              targetQuarter={f.targetQuarter}
              onNotify={f.onNotify}
            />
          ))}
          {overflow > 0 && (
            <div className="flex shrink-0 items-center px-4 text-sm text-muted-foreground">
              +{overflow} more
            </div>
          )}
        </div>
      )}
    </section>
  );
}
