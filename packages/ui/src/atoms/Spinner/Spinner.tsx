import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const spinnerVariants = cva(
  "animate-spin motion-reduce:animate-none text-muted-foreground",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

/** Props for the Spinner atom */
export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  /** Accessible label for screen readers. */
  label?: string;
  className?: string;
}

/**
 * Spinner atom — simple SVG spinner for inline loading states.
 *
 * Sizes: sm (16px), md (20px), lg (24px).
 * Animation: CSS spin, disabled when prefers-reduced-motion is set.
 */
export function Spinner({ size, label = "Loading", className }: SpinnerProps) {
  return (
    <svg
      className={cn(spinnerVariants({ size }), className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label={label}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export { spinnerVariants };
