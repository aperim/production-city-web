import { cn } from '../../lib/utils';

/** Feature lifecycle status */
export type FeatureStatus = 'active' | 'coming_soon' | 'planned' | 'deprecated';

/** Props for the FeatureStatusBadge atom */
export interface FeatureStatusBadgeProps {
  /** The feature status to display */
  status: FeatureStatus;
  /** Additional class names */
  className?: string;
}

const STATUS_CONFIG: Record<FeatureStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  coming_soon: {
    label: 'Coming Soon',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  planned: {
    label: 'Planned',
    className: 'border-border bg-muted text-muted-foreground',
  },
  deprecated: {
    label: 'Deprecated',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
};

/**
 * FeatureStatusBadge atom — displays the lifecycle status of a dashboard feature.
 *
 * Four states: active (green), coming_soon (amber), planned (gray), deprecated (red).
 */
export function FeatureStatusBadge({ status, className }: FeatureStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        config.className,
        className,
      )}
      aria-label={config.label}
    >
      {config.label}
    </span>
  );
}
