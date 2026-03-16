import { cn } from '../../lib/utils';
import { FeatureStatusBadge, type FeatureStatus } from '../../atoms/FeatureStatusBadge/FeatureStatusBadge';
import { sanitizeHref } from '../../atoms/Link/Link';

/** Props for the ComingSoonCard molecule */
export interface ComingSoonCardProps {
  /** Feature ID */
  id: string;
  /** Feature display name */
  label: string;
  /** Feature description (will be truncated) */
  description: string;
  /** Feature status */
  status: FeatureStatus;
  /** Target implementation quarter (e.g., "Q3 2026") */
  targetQuarter?: string | null;
  /** Priority level */
  priority?: string;
  /** Navigation path */
  path: string;
  /** Additional class names */
  className?: string;
}

const PRIORITY_LABELS: Record<string, string> = {
  p1: 'First Wave',
  p2: 'Second Wave',
  p3: 'Future',
};

/**
 * ComingSoonCard molecule — compact card showing a feature's upcoming status.
 *
 * Used in ComingSoonPage "Related Features" section and search results.
 * Shows label, truncated description, status badge, target quarter, and priority.
 */
export function ComingSoonCard({
  id,
  label,
  description,
  status,
  targetQuarter,
  priority,
  path,
  className,
}: ComingSoonCardProps) {
  return (
    <a
      href={sanitizeHref(path)}
      data-testid={`coming-soon-card-${id}`}
      className={cn(
        'block rounded-sm border border-border bg-background p-4',
        'hover:bg-accent transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-medium text-foreground truncate">{label}</h3>
        <FeatureStatusBadge status={status} />
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{description}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {targetQuarter && <span>{targetQuarter}</span>}
        {priority && PRIORITY_LABELS[priority] && (
          <span>{PRIORITY_LABELS[priority]}</span>
        )}
      </div>
    </a>
  );
}
