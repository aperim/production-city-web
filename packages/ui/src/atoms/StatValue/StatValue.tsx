import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

const statValueVariants = cva("flex flex-col", {
  variants: {
    variant: {
      default: "gap-2",
      compact: "gap-1",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/** Props for the StatValue atom */
interface StatValueProps extends VariantProps<typeof statValueVariants> {
  /** The metric value to display (e.g., "2,025 sqm"). */
  value: ReactNode;
  /** Descriptive label for the value (e.g., "Total Area"). */
  label: ReactNode;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * StatValue atom — displays a single key metric with value and label.
 *
 * Clean, no decorative badges, glows, or KPI card styling.
 * Uses design system colors for proper contrast.
 */
function StatValue({ value, label, variant = "default", className }: StatValueProps) {
  return (
    <div className={cn(statValueVariants({ variant }), className)}>
      <span className={cn(
        "text-foreground font-semibold",
        variant === "compact" ? "text-lg" : "text-2xl",
      )}>
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export { StatValue, statValueVariants };
export type { StatValueProps };
