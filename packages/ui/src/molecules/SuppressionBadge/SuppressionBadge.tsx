import { cn } from '../../lib/utils';

/** Suppression reason */
export type SuppressionReason = 'hard_bounce' | 'spam_complaint';

/** Props for the SuppressionBadge molecule */
export interface SuppressionBadgeProps {
  /**
   * Reason for email suppression.
   */
  reason: SuppressionReason;
  /**
   * Whether the badge can be removed.
   */
  removable?: boolean;
  /**
   * Called when the remove button is clicked.
   */
  onRemove?: () => void;
  /**
   * Additional class names.
   */
  className?: string;
}

const reasonConfig: Record<SuppressionReason, { label: string; colorClass: string }> = {
  hard_bounce: {
    label: 'Hard bounce',
    colorClass: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  },
  spam_complaint: {
    label: 'Spam complaint',
    colorClass: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  },
};

/**
 * SuppressionBadge molecule — indicates an email address is suppressed.
 *
 * Shows the suppression reason (hard bounce or spam complaint) with
 * optional remove capability for admin use.
 */
export function SuppressionBadge({
  reason,
  removable = false,
  onRemove,
  className,
}: SuppressionBadgeProps) {
  const config = reasonConfig[reason];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium',
        config.colorClass,
        className,
      )}
    >
      <span>{config.label}</span>
      {removable && onRemove && (
        <button
          type="button"
          aria-label={`Remove ${config.label} suppression`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 shrink-0 rounded-sm opacity-60 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring min-h-[1.25rem] min-w-[1.25rem] flex items-center justify-center"
        >
          <span aria-hidden="true" className="text-xs leading-none">✕</span>
        </button>
      )}
    </span>
  );
}
