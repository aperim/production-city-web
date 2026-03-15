import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { SubscriptionStatus } from "../../types/announcements";

/** Props for the SubscriptionStatusDot atom. */
export interface SubscriptionStatusDotProps
  extends HTMLAttributes<HTMLSpanElement> {
  /** The subscription confirmation status. */
  status: SubscriptionStatus;
}

const dotStyles: Record<SubscriptionStatus, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-emerald-400",
  declined: "bg-red-400",
  expired: "bg-neutral-500",
};

const statusLabels: Record<SubscriptionStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  expired: "Expired",
};

/**
 * Coloured dot indicating subscription confirmation status.
 *
 * Uses aria-label for accessibility — the colour is supplemented by a
 * screen-reader-accessible label.
 */
function SubscriptionStatusDot({
  status,
  className,
  ...props
}: SubscriptionStatusDotProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    >
      <span
        className={cn("inline-block h-2 w-2 rounded-full", dotStyles[status])}
        aria-hidden="true"
      />
      <span className="text-xs text-muted-foreground">
        {statusLabels[status]}
      </span>
    </span>
  );
}

export { SubscriptionStatusDot };
