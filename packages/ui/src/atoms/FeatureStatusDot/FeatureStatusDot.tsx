import { cn } from '../../lib/utils';

export type FeatureDotStatus = 'active' | 'coming_soon' | 'disabled';

export interface FeatureStatusDotProps {
  /** Current status of the feature */
  status: FeatureDotStatus;
  /** Custom className */
  className?: string;
}

const STATUS_COLORS: Record<FeatureDotStatus, string> = {
  active: 'bg-emerald-500',
  coming_soon: 'bg-amber-500',
  disabled: 'bg-muted-foreground/40',
};

const STATUS_LABELS: Record<FeatureDotStatus, string> = {
  active: 'Active',
  coming_soon: 'Coming soon',
  disabled: 'Disabled',
};

/**
 * Small status dot indicating feature availability.
 * Used alongside tab labels in WorkspaceTabs.
 */
export function FeatureStatusDot({ status, className }: FeatureStatusDotProps) {
  return (
    <span
      role="status"
      aria-label={STATUS_LABELS[status]}
      className={cn(
        'inline-block h-1.5 w-1.5 rounded-full shrink-0',
        STATUS_COLORS[status],
        className,
      )}
    />
  );
}
