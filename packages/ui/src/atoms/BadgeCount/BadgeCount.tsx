import { cn } from '../../lib/utils';

export interface BadgeCountProps {
  /** Number to display */
  count: number;
  /** Custom className */
  className?: string;
}

/**
 * Numeric badge for sidebar inbox count.
 * Renders nothing when count is 0. Caps display at 99+.
 */
export function BadgeCount({ count, className }: BadgeCountProps) {
  if (count <= 0) return null;

  const display = count > 99 ? '99+' : String(count);

  return (
    <span
      aria-label={`${count} unread items`}
      className={cn(
        'inline-flex items-center justify-center rounded-sm bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground',
        'min-w-[18px] h-[18px]',
        className,
      )}
    >
      {display}
    </span>
  );
}
