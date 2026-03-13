import { cn } from "../../lib/utils";
import { MediaDisplay, type MediaDisplayProps } from "../MediaDisplay/MediaDisplay";

/** Props for the MediaGallery organism */
interface MediaGalleryProps {
  /** Array of media items to display */
  items: MediaDisplayProps[];
  /** Number of columns (responsive default: 1 on mobile, 2 on tablet, 3 on desktop) */
  columns?: 1 | 2 | 3;
  className?: string;
}

const columnClasses: Record<1 | 2 | 3, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

/**
 * MediaGallery organism — responsive grid of MediaDisplay components.
 *
 * Shows empty state when no items. Responsive columns.
 */
function MediaGallery({ items, columns = 3, className }: MediaGalleryProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border border-border bg-muted p-8 text-sm text-muted-foreground",
          className,
        )}
      >
        No media available
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        columnClasses[columns],
        className,
      )}
    >
      {items.map((item, index) => (
        <MediaDisplay key={`${item.lightSrc}-${index}`} {...item} />
      ))}
    </div>
  );
}

export { MediaGallery };
export type { MediaGalleryProps };
