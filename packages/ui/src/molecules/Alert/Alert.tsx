import { type ReactNode, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const alertVariants = cva(
  "relative flex w-full gap-3 rounded-sm border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
        success:
          "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
        warning:
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100",
        error:
          "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

/** Props for the Alert molecule */
export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title">,
    VariantProps<typeof alertVariants> {
  /**
   * Alert message content. ReactNode only.
   */
  children: ReactNode;
  /**
   * Optional title displayed above the message.
   */
  title?: ReactNode;
  /**
   * Optional icon displayed before the content.
   */
  icon?: ReactNode;
  /**
   * When true, shows a dismiss button.
   * @default false
   */
  dismissible?: boolean;
  /**
   * Called when the dismiss button is clicked.
   */
  onDismiss?: () => void;
  /**
   * Action slot rendered at the end of the alert.
   */
  action?: ReactNode;
  /**
   * Use role="alert" for assertive announcements, role="status" for polite.
   * Defaults to "alert" for error/warning, "status" for info/success.
   */
  role?: "alert" | "status";
}

/** Default icon text per variant */
const DEFAULT_ICONS: Record<string, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  error: "x",
};

/**
 * Alert / Banner molecule — informational, success, warning, or error message.
 *
 * Supports icons, titles, dismiss button, and action slot.
 * Uses role="alert" for errors/warnings (assertive) and role="status" for info/success (polite).
 * All content is ReactNode — no dangerouslySetInnerHTML used anywhere.
 */
export function Alert({
  variant = "info",
  children,
  title,
  icon,
  dismissible = false,
  onDismiss,
  action,
  role: roleProp,
  className,
  ...props
}: AlertProps) {
  const effectiveRole =
    roleProp ?? (variant === "error" || variant === "warning" ? "alert" : "status");

  const displayIcon = icon !== undefined ? icon : DEFAULT_ICONS[variant ?? "info"];

  return (
    <div
      role={effectiveRole}
      aria-live={effectiveRole === "alert" ? "assertive" : "polite"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {displayIcon != null && (
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-base leading-none font-medium">
          {displayIcon}
        </span>
      )}

      <div className="flex flex-1 flex-col gap-1">
        {title != null && (
          <p className="font-medium leading-none">{title}</p>
        )}
        <div className="leading-relaxed">{children}</div>
        {action != null && <div className="mt-1">{action}</div>}
      </div>

      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="shrink-0 self-start rounded-sm p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
        >
          <span aria-hidden="true">x</span>
        </button>
      )}
    </div>
  );
}
