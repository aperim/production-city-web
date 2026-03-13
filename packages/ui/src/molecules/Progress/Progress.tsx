import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const progressTrackVariants = cva(
  "relative overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "h-1.5",
        md: "h-2.5",
        lg: "h-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

/** Props for the linear Progress molecule */
export interface ProgressProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof progressTrackVariants> {
  /**
   * Current value (0–max).
   * Omit or pass undefined for indeterminate state.
   */
  value?: number;
  /**
   * Maximum value.
   * @default 100
   */
  max?: number;
  /**
   * Accessible label for the progress bar.
   */
  "aria-label"?: string;
  /**
   * Variant for the filled portion colour.
   * @default "default"
   */
  variant?: "default" | "success" | "warning" | "error";
}

const fillVariants: Record<string, string> = {
  default: "bg-primary",
  success: "bg-green-600",
  warning: "bg-amber-500",
  error: "bg-destructive",
};

/**
 * Progress molecule — linear progress bar with determinate and indeterminate states.
 *
 * Implements role="progressbar" with aria-valuenow/min/max.
 * Indeterminate when `value` is undefined (animated stripe).
 * Animations respect prefers-reduced-motion.
 */
export function Progress({
  value,
  max = 100,
  size,
  variant = "default",
  "aria-label": ariaLabel,
  className,
  ...props
}: ProgressProps) {
  const isIndeterminate = value === undefined;
  const clamped = isIndeterminate ? 0 : Math.min(Math.max(value, 0), max);
  const percentage = isIndeterminate ? 0 : (clamped / max) * 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : clamped}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
      aria-busy={isIndeterminate}
      className={cn(progressTrackVariants({ size }), className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300 ease-in-out motion-reduce:transition-none",
          fillVariants[variant],
          isIndeterminate &&
            "animate-[indeterminate_1.5s_ease-in-out_infinite] motion-reduce:animate-none w-1/3 absolute",
        )}
        style={isIndeterminate ? undefined : { width: `${percentage}%` }}
      />
      <style>{`
        @keyframes indeterminate {
          0% { left: -33%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}

// ------------------------------------------------------------------
// CircularProgress
// ------------------------------------------------------------------

/** Props for CircularProgress */
export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Current value (0–max). Omit for indeterminate.
   */
  value?: number;
  /**
   * Maximum value.
   * @default 100
   */
  max?: number;
  /**
   * Diameter in pixels.
   * @default 40
   */
  diameter?: number;
  /**
   * Stroke width in pixels.
   * @default 4
   */
  strokeWidth?: number;
  /**
   * Accessible label.
   */
  "aria-label"?: string;
  /**
   * Colour variant.
   * @default "default"
   */
  variant?: "default" | "success" | "warning" | "error";
}

const strokeVariants: Record<string, string> = {
  default: "stroke-primary",
  success: "stroke-green-600",
  warning: "stroke-amber-500",
  error: "stroke-destructive",
};

/**
 * CircularProgress — SVG ring progress indicator.
 *
 * Implements role="progressbar".
 * Indeterminate when `value` is undefined (spinning animation).
 */
export function CircularProgress({
  value,
  max = 100,
  diameter = 40,
  strokeWidth = 4,
  variant = "default",
  "aria-label": ariaLabel,
  className,
  ...props
}: CircularProgressProps) {
  const isIndeterminate = value === undefined;
  const r = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = isIndeterminate ? 0 : Math.min(Math.max(value, 0), max);
  const dashOffset = isIndeterminate ? 0 : circumference - (clamped / max) * circumference;

  return (
    <div
      role="progressbar"
      aria-valuenow={isIndeterminate ? undefined : clamped}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
      aria-busy={isIndeterminate}
      className={cn(
        "inline-flex",
        isIndeterminate && "animate-spin motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <svg
        width={diameter}
        height={diameter}
        viewBox={`0 0 ${diameter} ${diameter}`}
        fill="none"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={r}
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={r}
          className={cn(strokeVariants[variant], "transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none")}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={isIndeterminate ? circumference * 0.75 : dashOffset}
          transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`}
        />
      </svg>
    </div>
  );
}
