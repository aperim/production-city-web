import { cn } from '../../lib/utils';

/** Status types for users and invitations */
export type StatusType =
  | 'active'
  | 'pending_approval'
  | 'deactivated'
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'revoked';

/** Props for the StatusIndicator molecule */
export interface StatusIndicatorProps {
  /**
   * Current status.
   */
  status: StatusType;
  /**
   * Display size.
   * @default "md"
   */
  size?: 'sm' | 'md';
  /**
   * Additional class names.
   */
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; dotClass: string; textClass: string }> = {
  active: {
    label: 'Active',
    dotClass: 'bg-green-500',
    textClass: 'text-green-700 dark:text-green-400',
  },
  pending_approval: {
    label: 'Pending approval',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  deactivated: {
    label: 'Deactivated',
    dotClass: 'bg-muted-foreground',
    textClass: 'text-muted-foreground',
  },
  pending: {
    label: 'Pending',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  accepted: {
    label: 'Accepted',
    dotClass: 'bg-green-500',
    textClass: 'text-green-700 dark:text-green-400',
  },
  expired: {
    label: 'Expired',
    dotClass: 'bg-muted-foreground',
    textClass: 'text-muted-foreground',
  },
  revoked: {
    label: 'Revoked',
    dotClass: 'bg-red-500',
    textClass: 'text-red-700 dark:text-red-400',
  },
};

/**
 * StatusIndicator molecule — shows user/invitation status with a colored dot.
 *
 * Simple dot + label, no pseudo-elements or decorative effects.
 * Follows Uncodixify: functional status indicators only.
 */
export function StatusIndicator({
  status,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        size === 'sm' ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'shrink-0 rounded-full',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          config.dotClass,
        )}
      />
      <span className={config.textClass}>{config.label}</span>
    </span>
  );
}
