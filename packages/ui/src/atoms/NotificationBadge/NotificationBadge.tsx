import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

/** Props for the NotificationBadge atom */
interface NotificationBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Number of unread notifications. Hidden when 0 or undefined. */
  count?: number;
}

/**
 * NotificationBadge atom -- numeric badge showing unread count.
 *
 * Renders nothing when count is 0 or undefined.
 * Caps display at "99+".
 */
function NotificationBadge({ count, className, ...props }: NotificationBadgeProps) {
  if (!count || count <= 0) return null;

  const display = count > 99 ? "99+" : String(count);

  return (
    <span
      aria-label={`${count} unread notifications`}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium leading-none",
        count > 99 ? "min-w-5 h-4 px-1" : "min-w-4 h-4 px-1",
        className,
      )}
      {...props}
    >
      {display}
    </span>
  );
}

export { NotificationBadge };
export type { NotificationBadgeProps };
