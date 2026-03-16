'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { FeatureStatusBadge, type FeatureStatus } from '../../atoms/FeatureStatusBadge/FeatureStatusBadge';
import { ComingSoonCard } from '../../molecules/ComingSoonCard/ComingSoonCard';

/** Feature data for the coming soon page */
export interface ComingSoonFeature {
  id: string;
  label: string;
  description: string;
  status: 'planned' | 'coming_soon';
  targetQuarter: string | null;
  priority: string;
  phase: string;
}

/** Related feature for the sidebar section */
export interface RelatedFeature {
  id: string;
  label: string;
  status: FeatureStatus;
  targetQuarter: string | null;
  path: string;
}

/** Notify Me button state */
export type NotifyMeState = 'idle' | 'submitting' | 'subscribed' | 'error';

/** Props for the ComingSoonPage template */
export interface ComingSoonPageProps {
  /** Feature data from registry */
  feature: ComingSoonFeature;
  /** Related features in the same subsection */
  relatedFeatures?: RelatedFeature[];
  /** Callback when Notify Me is clicked */
  onNotifyMe?: () => Promise<void>;
  /** Initial notify-me state (e.g., already subscribed) */
  notifyMeState?: NotifyMeState;
  /** Additional class names */
  className?: string;
}

const PHASE_LABELS: Record<string, string> = {
  company_formation: 'Company Formation',
  site_acquisition: 'Site Acquisition',
  planning_approvals: 'Planning & Approvals',
  design_construct: 'Design & Construction',
  pre_operations: 'Pre-Operations',
  operations: 'Operations',
  expansion: 'Expansion',
};

const PRIORITY_LABELS: Record<string, string> = {
  p0: 'Scaffold',
  p1: 'First Wave',
  p2: 'Second Wave',
  p3: 'Future',
};

/**
 * ComingSoonPage template — full-page placeholder for features not yet active.
 *
 * All content is derived from the registry — no per-feature authoring needed.
 * Shows feature metadata, a "Notify Me" button, and related features.
 */
export function ComingSoonPage({
  feature,
  relatedFeatures = [],
  onNotifyMe,
  notifyMeState: initialState = 'idle',
  className,
}: ComingSoonPageProps) {
  const [notifyState, setNotifyState] = useState<NotifyMeState>(initialState);

  const handleNotifyMe = async () => {
    if (!onNotifyMe || notifyState === 'subscribed' || notifyState === 'submitting') return;
    setNotifyState('submitting');
    try {
      await onNotifyMe();
      setNotifyState('subscribed');
    } catch {
      setNotifyState('error');
    }
  };

  return (
    <div className={cn('max-w-2xl mx-auto px-4 py-12', className)}>
      {/* Icon area */}
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 rounded-sm bg-muted flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Title and description */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <h1 className="text-xl font-semibold text-foreground">{feature.label}</h1>
          <FeatureStatusBadge status={feature.status} />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
          {feature.description}
        </p>
      </div>

      {/* Metadata */}
      <div className="border border-border rounded-sm p-4 mb-8 max-w-sm mx-auto">
        <dl className="flex flex-col gap-2 text-sm">
          {feature.targetQuarter && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Target</dt>
              <dd className="text-foreground font-medium">{feature.targetQuarter}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Priority</dt>
            <dd className="text-foreground">{PRIORITY_LABELS[feature.priority] ?? feature.priority}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Phase</dt>
            <dd className="text-foreground">{PHASE_LABELS[feature.phase] ?? feature.phase}</dd>
          </div>
        </dl>
      </div>

      {/* Notify Me */}
      {onNotifyMe && (
        <div className="text-center mb-12">
          <button
            type="button"
            onClick={handleNotifyMe}
            disabled={notifyState === 'submitting' || notifyState === 'subscribed'}
            className={cn(
              'inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2 text-sm font-medium',
              'transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              notifyState === 'subscribed'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : notifyState === 'error'
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                  : 'text-foreground hover:bg-accent',
              (notifyState === 'submitting' || notifyState === 'subscribed') && 'cursor-not-allowed opacity-70',
            )}
          >
            {notifyState === 'submitting' && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="7" />
              </svg>
            )}
            {notifyState === 'idle' && 'Notify me when this launches'}
            {notifyState === 'submitting' && 'Subscribing...'}
            {notifyState === 'subscribed' && 'Subscribed'}
            {notifyState === 'error' && 'Failed — tap to retry'}
          </button>
        </div>
      )}

      {/* Related Features */}
      {relatedFeatures.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Related Features</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedFeatures.map((rf) => (
              <ComingSoonCard
                key={rf.id}
                id={rf.id}
                label={rf.label}
                description=""
                status={rf.status}
                targetQuarter={rf.targetQuarter}
                path={rf.path}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
