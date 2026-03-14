import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

const notificationToastVariants = cva(
  "flex items-start gap-2.5 rounded-sm border px-3 py-2.5 text-sm shadow-sm",
  {
    variants: {
      variant: {
        info: "border-border bg-card text-card-foreground",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

/** Props for the NotificationToast molecule */
interface NotificationToastProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof notificationToastVariants> {
  /** Toast message text */
  message: ReactNode;
  /** Optional icon element */
  icon?: ReactNode;
  /** Called when the dismiss button is clicked */
  onDismiss?: () => void;
}

/**
 * NotificationToast molecule -- slide-in toast for real-time notifications.
 *
 * Supports info, success, and warning variants.
 * Has a dismiss button and supports an optional icon.
 */
function NotificationToast({
  variant,
  message,
  icon,
  onDismiss,
  className,
  ...props
}: NotificationToastProps) {
  return (
    <div
      role="alert"
      aria-live={variant === "warning" ? "assertive" : "polite"}
      className={cn(notificationToastVariants({ variant, className }))}
      {...props}
    >
      {icon && <span className="shrink-0 mt-0.5" aria-hidden="true">{icon}</span>}
      <span className="flex-1 min-w-0">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export { NotificationToast, notificationToastVariants };
export type { NotificationToastProps };
