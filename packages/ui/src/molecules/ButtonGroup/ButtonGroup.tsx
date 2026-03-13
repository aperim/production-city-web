import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Props for the ButtonGroup molecule */
export interface ButtonGroupProps {
  /** Button elements to group. */
  children: ReactNode;
  /**
   * Layout direction.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Visual variant for connected or spaced buttons.
   * - "connected": buttons share borders (segmented control style)
   * - "spaced": buttons maintain their own radius with a gap
   * @default "spaced"
   */
  variant?: "connected" | "spaced";
  /**
   * Accessible label for the group.
   */
  "aria-label"?: string;
  /**
   * Additional class names for the root element.
   */
  className?: string;
}

/**
 * ButtonGroup molecule — groups related buttons with proper ARIA role.
 *
 * Use `variant="connected"` for segmented controls (shared borders, flat inner edges).
 * Use `variant="spaced"` for a toolbar-like arrangement.
 */
export function ButtonGroup({
  children,
  orientation = "horizontal",
  variant = "spaced",
  "aria-label": ariaLabel,
  className,
}: ButtonGroupProps) {
  const isHorizontal = orientation === "horizontal";
  const isConnected = variant === "connected";

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex",
        isHorizontal ? "flex-row" : "flex-col",
        isConnected
          ? [
              "[&>button]:rounded-none",
              isHorizontal
                ? [
                    "[&>button:first-child]:rounded-s-sm",
                    "[&>button:last-child]:rounded-e-sm",
                    "[&>button:not(:first-child)]:border-s-0",
                  ]
                : [
                    "[&>button:first-child]:rounded-t-sm",
                    "[&>button:last-child]:rounded-b-sm",
                    "[&>button:not(:first-child)]:border-t-0",
                  ],
            ]
          : isHorizontal
            ? "gap-2"
            : "gap-2 flex-col",
        className,
      )}
    >
      {children}
    </div>
  );
}
