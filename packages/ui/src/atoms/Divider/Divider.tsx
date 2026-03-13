import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const dividerVariants = cva("", {
  variants: {
    orientation: {
      horizontal: "w-full flex items-center",
      vertical: "h-full flex flex-col items-center",
    },
    variant: {
      solid: "",
      dashed: "",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    variant: "solid",
  },
});

/** Props for the Divider atom */
interface DividerProps extends VariantProps<typeof dividerVariants> {
  /**
   * Optional label text or node rendered in the centre of the divider.
   */
  label?: ReactNode;
  className?: string;
}

/**
 * Divider atom - horizontal or vertical separator with optional label.
 *
 * Orientations: horizontal, vertical.
 * Variants: solid, dashed.
 * Accessibility: role="separator" with aria-orientation.
 */
function Divider({
  orientation = "horizontal",
  variant = "solid",
  label,
  className,
}: DividerProps) {
  const isHorizontal = orientation === "horizontal";
  const isDashed = variant === "dashed";

  if (isHorizontal && label != null) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn("flex items-center gap-3 w-full my-1", className)}
      >
        <span
          className={cn(
            "flex-1 border-t border-border",
            isDashed && "border-dashed",
          )}
          aria-hidden="true"
        />
        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
        <span
          className={cn(
            "flex-1 border-t border-border",
            isDashed && "border-dashed",
          )}
          aria-hidden="true"
        />
      </div>
    );
  }

  if (isHorizontal) {
    return (
      <hr
        role="separator"
        aria-orientation="horizontal"
        className={cn(
          "w-full border-0 border-t border-border my-1",
          isDashed && "border-dashed",
          className,
        )}
      />
    );
  }

  // Vertical orientation
  return (
    <span
      role="separator"
      aria-orientation="vertical"
      className={cn(
        "inline-block w-px self-stretch bg-border mx-1",
        isDashed && "bg-transparent border-s border-dashed border-border",
        className,
      )}
    />
  );
}

export { Divider, dividerVariants };
export type { DividerProps };
