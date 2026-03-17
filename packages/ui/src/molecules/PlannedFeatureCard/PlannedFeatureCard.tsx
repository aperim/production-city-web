import { cn } from '../../lib/utils';

export interface PlannedFeatureCardProps {
  /** Feature ID */
  featureId: string;
  /** Feature display name */
  label: string;
  /** Feature description */
  description: string;
  /** Feature status */
  status: 'coming_soon' | 'planned';
  /** Target quarter (e.g., "Q3 2026") */
  targetQuarter?: string | null;
  /** Called when notify button is clicked */
  onNotify: (featureId: string) => void;
  /** Additional class names */
  className?: string;
}

/**
 * PlannedFeatureCard molecule — compact card for planned/coming-soon features.
 *
 * Shows name, truncated description (2 lines), status, target date, and notify button.
 * Used inside PlannedSection organism.
 */
export function PlannedFeatureCard({
  featureId,
  label,
  description,
  status,
  targetQuarter,
  onNotify,
  className,
}: PlannedFeatureCardProps) {
  const statusLabel = status === 'coming_soon' && targetQuarter
    ? targetQuarter
    : 'Planned';

  return (
    <div
      data-testid={`planned-feature-card-${featureId}`}
      className={cn(
        'flex w-64 shrink-0 flex-col gap-2 rounded-sm border border-border bg-background p-4',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground truncate">{label}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">{statusLabel}</span>
      </div>
      <p
        data-description
        className="text-xs text-muted-foreground line-clamp-2"
      >
        {description}
      </p>
      <button
        type="button"
        onClick={() => onNotify(featureId)}
        className="mt-auto self-start rounded-sm border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Notify
      </button>
    </div>
  );
}
