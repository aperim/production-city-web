import { cn } from "../../lib/utils";
import { Skeleton, SkeletonText } from "../../atoms/Skeleton/Skeleton";

/** Props for the SkeletonCard molecule */
export interface SkeletonCardProps {
  className?: string;
}

/**
 * SkeletonCard molecule — card-shaped skeleton matching StatCard dimensions.
 *
 * Accessibility: aria-hidden="true" — purely decorative.
 * Animation: inherits Skeleton pulse, respects prefers-reduced-motion.
 */
export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex flex-col gap-3 p-4 border border-border rounded-sm",
        className,
      )}
    >
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="rectangular" height={32} width="60%" />
      <SkeletonText lines={2} />
    </div>
  );
}
