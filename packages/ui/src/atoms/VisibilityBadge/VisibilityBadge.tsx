import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { AnnouncementVisibility } from "../../types/announcements";

/** Props for the VisibilityBadge atom. */
export interface VisibilityBadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  /** The visibility level. */
  visibility: AnnouncementVisibility;
}

const visibilityStyles: Record<AnnouncementVisibility, string> = {
  public: "bg-sky-900/30 text-sky-400 border-sky-800/50",
  private: "bg-amber-900/30 text-amber-400 border-amber-800/50",
};

const visibilityLabels: Record<AnnouncementVisibility, string> = {
  public: "Public",
  private: "Private",
};

/**
 * Visual indicator for public/private visibility of an announcement.
 */
function VisibilityBadge({
  visibility,
  className,
  ...props
}: VisibilityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        visibilityStyles[visibility],
        className,
      )}
      {...props}
    >
      {visibilityLabels[visibility]}
    </span>
  );
}

export { VisibilityBadge };
