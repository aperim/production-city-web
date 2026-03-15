import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { AnnouncementStatus } from "../../types/announcements";

/** Props for the AnnouncementStatusBadge atom. */
export interface AnnouncementStatusBadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  /** The announcement's publication status. */
  status: AnnouncementStatus;
}

const statusStyles: Record<AnnouncementStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-900/30 text-emerald-400 border-emerald-800/50",
  archived: "bg-neutral-800/50 text-neutral-400 border-neutral-700/50",
};

const statusLabels: Record<AnnouncementStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

/**
 * Visual indicator for announcement publication status (draft/published/archived).
 *
 * Uses subtle background tints and text colours to distinguish states
 * without relying on bright colour alone (accessible).
 */
function AnnouncementStatusBadge({
  status,
  className,
  ...props
}: AnnouncementStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
        className,
      )}
      {...props}
    >
      {statusLabels[status]}
    </span>
  );
}

export { AnnouncementStatusBadge };
