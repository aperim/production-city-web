import { cn } from "../../lib/utils";
import { Skeleton } from "../../atoms/Skeleton/Skeleton";

/** Props for the SkeletonTableRow molecule */
export interface SkeletonTableRowProps {
  /** Number of cells (columns) in the row. @default 4 */
  columns?: number;
  className?: string;
}

/**
 * SkeletonTableRow molecule — table row skeleton with column cells.
 *
 * Accessibility: aria-hidden="true" — purely decorative.
 * Animation: inherits Skeleton pulse, respects prefers-reduced-motion.
 */
export function SkeletonTableRow({ columns = 4, className }: SkeletonTableRowProps) {
  return (
    <tr aria-hidden="true" className={cn("border-b border-border", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton
            variant="text"
            width={i === 0 ? "70%" : i === columns - 1 ? "40%" : "60%"}
          />
        </td>
      ))}
    </tr>
  );
}
