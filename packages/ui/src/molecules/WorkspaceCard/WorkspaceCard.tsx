'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { WorkspaceIcon } from '../../atoms/WorkspaceIcon/WorkspaceIcon';
import { FeatureStatusDot, type FeatureDotStatus } from '../../atoms/FeatureStatusDot/FeatureStatusDot';

export interface WorkspaceCardStat {
  label: string;
  value: string;
}

export interface WorkspaceCardTab {
  id: string;
  label: string;
  status: 'active' | 'coming_soon' | 'planned';
}

export interface WorkspaceCardAction {
  label: string;
  onClick: () => void;
}

export interface WorkspaceCardProps {
  workspace: { id: string; label: string; icon: string; description: string };
  stats: WorkspaceCardStat[];
  activeFeatureCount: number;
  upcomingFeatureCount: number;
  tabs: WorkspaceCardTab[];
  primaryAction?: WorkspaceCardAction;
  onNavigate: (path: string) => void;
  className?: string;
}

/**
 * Home dashboard workspace card. Shows icon, name, stats, feature counts,
 * expandable tab list, and primary action.
 */
export function WorkspaceCard({
  workspace,
  stats,
  activeFeatureCount,
  upcomingFeatureCount,
  tabs,
  primaryAction,
  onNavigate,
  className,
}: WorkspaceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {/* Card body -- clickable to navigate */}
      <button
        type="button"
        onClick={() => onNavigate(`/dashboard/${workspace.id}`)}
        className="w-full p-4 text-left hover:bg-accent/30 transition-colors duration-150 rounded-t-lg"
      >
        <div className="flex items-start gap-3">
          <WorkspaceIcon icon={workspace.icon} size={24} decorative className="mt-0.5 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">{workspace.label}</h3>
            {stats.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                {stats.map((s) => (
                  <span key={s.label} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{s.value}</span>{' '}
                    {s.label}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              <span>{activeFeatureCount} active</span>
              <span className="mx-1">&middot;</span>
              <span>{upcomingFeatureCount} upcoming</span>
            </p>
          </div>
        </div>
      </button>

      {/* Actions row */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        {primaryAction ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); primaryAction.onClick(); }}
            className="text-sm font-medium text-primary hover:underline"
          >
            {primaryAction.label}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? 'Collapse tabs' : 'Expand tabs'}
          aria-expanded={expanded}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cn('transition-transform duration-150', expanded && 'rotate-180')}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Expanded tabs */}
      {expanded && (
        <div className="border-t border-border px-4 py-2 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(`/dashboard/${workspace.id}/${tab.id}`)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50 transition-colors duration-150"
            >
              <FeatureStatusDot status={(tab.status === 'planned' ? 'disabled' : tab.status) as FeatureDotStatus} />
              <span className={cn(tab.status !== 'active' && 'text-muted-foreground')}>{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
