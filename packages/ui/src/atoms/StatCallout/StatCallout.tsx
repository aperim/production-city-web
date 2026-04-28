import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const statCalloutVariants = cva("flex flex-col gap-1", {
  variants: {
    variant: {
      default: "[&_.stat-value]:text-foreground [&_.stat-label]:text-muted-foreground",
      muted: "[&_.stat-value]:text-muted-foreground [&_.stat-label]:text-muted-foreground",
      accent: "[&_.stat-value]:text-[--color-accent] [&_.stat-label]:text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/** Props for the StatCallout atom */
interface StatCalloutProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCalloutVariants> {
  /** The numeric or string value to display at display scale. */
  value: string;
  /** Descriptive label shown below the value (e.g. "Global VP market (2025)"). */
  label: string;
  /** Optional secondary context line (e.g. source or note). */
  context?: string;
  /** Optional prefix rendered before the value (e.g. "$", "AUD"). */
  prefix?: string;
  /** Optional suffix rendered after the value (e.g. "%", "B"). */
  suffix?: string;
}

/**
 * StatCallout atom — large display-tier number with label and optional context.
 *
 * Supports three variants: default (foreground), muted, accent.
 * Example: `<StatCallout value="3.83" prefix="$" suffix="B" label="Global VP market (2025)" />`
 */
function StatCallout({
  value,
  label,
  context,
  prefix,
  suffix,
  variant,
  className,
  ...props
}: StatCalloutProps) {
  return (
    <div className={cn(statCalloutVariants({ variant }), className)} {...props}>
      <p
        className="stat-value font-[--mono] leading-none tracking-tight"
        style={{ fontSize: "var(--font-size-display, clamp(2.5rem, 6vw, 5rem))" }}
      >
        {prefix && (
          <span className="text-[0.5em] align-top mr-0.5">{prefix}</span>
        )}
        {value}
        {suffix && (
          <span className="text-[0.5em] align-top ml-0.5">{suffix}</span>
        )}
      </p>
      <p className="stat-label font-[--mono] text-sm uppercase tracking-widest">{label}</p>
      {context && (
        <p className="text-xs text-muted-foreground">{context}</p>
      )}
    </div>
  );
}

export { StatCallout, statCalloutVariants };
export type { StatCalloutProps };
