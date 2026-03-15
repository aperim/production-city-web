'use client';

import { cn } from "../../lib/utils";

/** Props for the EoiStats organism */
export interface EoiStatsProps {
  /** Stats by category */
  byCategory: Record<string, number>;
  /** Stats by status */
  byStatus: Record<string, number>;
  /** Total count */
  total: number;
  /** Whether stats are loading */
  loading?: boolean;
  /** Label map for categories */
  categoryLabels?: Record<string, string>;
  /** Label map for statuses */
  statusLabels?: Record<string, string>;
  /** Title text */
  title?: string;
  className?: string;
}

/**
 * EoiStats organism -- stats cards showing totals by category and status.
 */
function EoiStats({
  byCategory,
  byStatus,
  total,
  loading = false,
  categoryLabels = {},
  statusLabels = {},
  title = "Overview",
  className,
}: EoiStatsProps) {
  if (loading) {
    return (
      <div className={cn("flex gap-3 flex-wrap", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-28 bg-muted/50 rounded-sm animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{`${total} total`}</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(byStatus).map(([status, count]) => (
          <div key={status} className="px-3 py-2 border border-border rounded-sm bg-card">
            <div className="text-lg font-medium text-foreground">{count}</div>
            <div className="text-xs text-muted-foreground">{statusLabels[status] ?? status}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {Object.entries(byCategory).map(([cat, count]) => (
          <div key={cat} className="px-2 py-1 text-xs border border-border rounded-sm bg-card">
            <span className="text-muted-foreground">{categoryLabels[cat] ?? cat}:</span>{" "}
            <span className="font-medium text-foreground">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { EoiStats };
