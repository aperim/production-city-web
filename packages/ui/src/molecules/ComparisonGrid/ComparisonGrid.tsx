import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ComparisonRow {
  /** Row descriptor shown in the left-most column. */
  label: string;
  /** Value for the left (typically competitor/old) column. */
  left: string;
  /** Value for the right (typically Production City/new) column. */
  right: string;
}

/** Props for the ComparisonGrid molecule */
interface ComparisonGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Heading for the left column. */
  leftHeading: string;
  /** Heading for the right column. */
  rightHeading: string;
  /** Row data. */
  rows: ComparisonRow[];
  /**
   * When true, applies foreground/accent treatment to the right column.
   * Defaults to true.
   */
  highlightRight?: boolean;
}

/**
 * ComparisonGrid molecule — two-column comparison table with clear visual hierarchy.
 *
 * Left column uses muted treatment; right column uses foreground/accent when
 * `highlightRight` is true (default). Collapses to a stacked card layout on mobile.
 */
function ComparisonGrid({
  leftHeading,
  rightHeading,
  rows,
  highlightRight = true,
  className,
  ...props
}: ComparisonGridProps) {
  return (
    <div className={cn("w-full overflow-hidden rounded-md border border-border", className)} {...props}>
      {/* Header row */}
      <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-muted/30">
        <div className="px-4 py-3" />
        <div className="px-4 py-3 border-l border-border">
          <span className="font-[--mono] text-xs uppercase tracking-widest text-muted-foreground">
            {leftHeading}
          </span>
        </div>
        <div
          className={cn(
            "px-4 py-3 border-l border-border",
            highlightRight && "bg-accent/10",
          )}
        >
          <span
            className={cn(
              "font-[--mono] text-xs uppercase tracking-widest",
              highlightRight ? "text-foreground font-semibold" : "text-muted-foreground",
            )}
          >
            {rightHeading}
          </span>
        </div>
      </div>

      {/* Data rows — desktop grid / mobile cards */}
      <div className="hidden sm:block">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "grid grid-cols-[1fr_1fr_1fr] border-b border-border last:border-b-0",
              i % 2 === 0 ? "bg-background" : "bg-muted/10",
            )}
          >
            <div className="px-4 py-3 font-[--mono] text-sm text-muted-foreground">{row.label}</div>
            <div className="px-4 py-3 border-l border-border text-sm text-muted-foreground">{row.left}</div>
            <div
              className={cn(
                "px-4 py-3 border-l border-border text-sm",
                highlightRight ? "text-foreground font-medium" : "text-muted-foreground",
                highlightRight && "bg-accent/5",
              )}
            >
              {row.right}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: stacked card per row */}
      <div className="sm:hidden divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="p-4 space-y-2">
            <p className="font-[--mono] text-xs uppercase tracking-widest text-muted-foreground">
              {row.label}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-[--mono] text-xs text-muted-foreground mb-0.5">{leftHeading}</p>
                <p className="text-sm text-muted-foreground">{row.left}</p>
              </div>
              <div>
                <p
                  className={cn(
                    "font-[--mono] text-xs mb-0.5",
                    highlightRight ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {rightHeading}
                </p>
                <p
                  className={cn(
                    "text-sm",
                    highlightRight ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {row.right}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ComparisonGrid };
export type { ComparisonGridProps, ComparisonRow };
