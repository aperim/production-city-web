import { cn } from '../../lib/utils';

export type AttentionPriority = 'urgent' | 'action' | 'info';

export interface AttentionDotProps {
  /** Priority level determines dot color */
  priority: AttentionPriority;
  /** Additional CSS classes */
  className?: string;
}

const PRIORITY_CLASSES: Record<AttentionPriority, string> = {
  urgent: 'bg-red-500',
  action: 'bg-amber-500',
  info: 'bg-blue-500',
};

const PRIORITY_LABELS: Record<AttentionPriority, string> = {
  urgent: 'Urgent',
  action: 'Action needed',
  info: 'Info',
};

/**
 * Small colored dot indicating notification priority.
 * Red = urgent, amber = action needed, blue = informational.
 */
export function AttentionDot({ priority, className }: AttentionDotProps) {
  return (
    <span
      className={cn('inline-block h-2 w-2 shrink-0 rounded-full', PRIORITY_CLASSES[priority], className)}
      role="status"
    >
      <span className="sr-only">{PRIORITY_LABELS[priority]}</span>
    </span>
  );
}
