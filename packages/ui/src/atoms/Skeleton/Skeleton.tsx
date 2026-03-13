import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const skeletonVariants = cva(
  [
    "bg-muted",
    // Pulse animation that respects prefers-reduced-motion
    "animate-pulse motion-reduce:animate-none",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Rectangular block - use for images, cards, or custom shapes. */
        rectangular: "rounded-sm",
        /** Circular - use for avatars or icon placeholders. */
        circular: "rounded-full",
        /** Text line - use for text content placeholders. */
        text: "rounded-xs h-4",
      },
    },
    defaultVariants: {
      variant: "rectangular",
    },
  },
);

/** Props for the Skeleton atom */
interface SkeletonProps extends VariantProps<typeof skeletonVariants> {
  /**
   * Width of the skeleton. Accepts any CSS value or Tailwind width class.
   * Defaults to 100%.
   */
  width?: string | number;
  /**
   * Height of the skeleton. Accepts any CSS value or Tailwind height class.
   * Defaults to auto based on variant (text: 1rem, others: required).
   */
  height?: string | number;
  className?: string;
}

/**
 * Skeleton atom - loading placeholder with pulse animation.
 *
 * Variants: text, circular, rectangular.
 * Animation: CSS pulse, disabled when prefers-reduced-motion is set.
 * Accessibility: aria-hidden="true" - skeletons are decorative.
 */
function Skeleton({ variant, width, height, className }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width !== undefined) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn(
        skeletonVariants({ variant }),
        width === undefined && "w-full",
        className,
      )}
    />
  );
}

/**
 * SkeletonText - renders multiple skeleton text lines.
 *
 * Convenience wrapper for text-type skeletons.
 */
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-2 w-full", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          // Make the last line shorter for a realistic appearance
          width={i === lines - 1 ? "70%" : "100%"}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText, skeletonVariants };
export type { SkeletonProps };
