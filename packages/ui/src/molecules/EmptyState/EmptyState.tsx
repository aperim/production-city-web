import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

/** Props for the EmptyState molecule */
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Illustration or icon slot. ReactNode only.
   */
  illustration?: ReactNode;
  /**
   * Primary heading for the empty state.
   */
  title: ReactNode;
  /**
   * Supporting description text.
   */
  description?: ReactNode;
  /**
   * Call-to-action element (button, link, etc.).
   */
  action?: ReactNode;
  /**
   * Visual size variant.
   * - "page": full-page centered (padding 64px+)
   * - "inline": compact for use inside tables/lists
   * @default "page"
   */
  variant?: "page" | "inline";
}

/**
 * EmptyState molecule — zero-state placeholder for data display areas.
 *
 * Supports illustration slot, title, description, and CTA.
 * Variants: page-level and inline (for tables/lists).
 */
export function EmptyState({
  illustration,
  title,
  description,
  action,
  variant = "page",
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "page" ? "py-16 px-6" : "py-8 px-4",
        className,
      )}
      {...props}
    >
      {illustration != null && (
        <div
          aria-hidden="true"
          className={cn(
            "mb-4 text-muted-foreground",
            variant === "page" ? "text-5xl" : "text-3xl",
          )}
        >
          {illustration}
        </div>
      )}

      <p
        className={cn(
          "font-medium text-foreground",
          variant === "page" ? "text-base" : "text-sm",
        )}
      >
        {title}
      </p>

      {description != null && (
        <p
          className={cn(
            "mt-1 text-muted-foreground",
            variant === "page" ? "text-sm max-w-sm" : "text-xs max-w-xs",
          )}
        >
          {description}
        </p>
      )}

      {action != null && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}
