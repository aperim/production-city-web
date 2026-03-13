import { type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

/** Props for the Pagination molecule */
export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /**
   * Current page (1-based).
   */
  page: number;
  /**
   * Total number of pages.
   */
  totalPages: number;
  /**
   * Called when the user navigates to a different page.
   */
  onPageChange: (page: number) => void;
  /**
   * Number of sibling pages to show around the current page.
   * @default 1
   */
  siblingCount?: number;
  /**
   * When true, shows total count label.
   */
  showTotal?: boolean;
  /**
   * Total number of items (for "X of Y" display).
   */
  totalItems?: number;
  /**
   * Page size for "X of Y" display.
   */
  pageSize?: number;
  /**
   * Accessible label for the nav landmark.
   * @default "Pagination"
   */
  "aria-label"?: string;
}

const ELLIPSIS = "...";

function buildPages(current: number, total: number, siblingCount: number): (number | string)[] {
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  const totalPageNumbers = siblingCount * 2 + 5; // siblings + current + 2 ends + 2 ellipses

  if (total <= totalPageNumbers) {
    return range(1, total);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, 3 + siblingCount * 2);
    return [...leftRange, ELLIPSIS, total];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = range(total - (2 + siblingCount * 2), total);
    return [1, ELLIPSIS, ...rightRange];
  }

  if (showLeftDots && showRightDots) {
    const middleRange = range(leftSibling, rightSibling);
    return [1, ELLIPSIS, ...middleRange, ELLIPSIS, total];
  }

  return range(1, total);
}

const pageButtonClass = cn(
  "inline-flex h-8 min-w-8 items-center justify-center rounded-sm border border-border px-2 text-sm font-medium",
  "transition-colors duration-150",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "disabled:pointer-events-none disabled:opacity-50",
);

/**
 * Pagination molecule — page controls with prev/next and numbered pages.
 *
 * Shows ellipsis for large page ranges.
 * Implements nav landmark with aria-label.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showTotal = false,
  totalItems,
  pageSize,
  "aria-label": ariaLabel = "Pagination",
  className,
  ...props
}: PaginationProps) {
  const pages = buildPages(page, totalPages, siblingCount);
  const startItem = pageSize ? (page - 1) * pageSize + 1 : undefined;
  const endItem = pageSize ? Math.min(page * pageSize, totalItems ?? 0) : undefined;

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      {showTotal && totalItems != null && startItem != null && endItem != null && (
        <span className="me-2 text-sm text-muted-foreground">
          {startItem}–{endItem} of {totalItems}
        </span>
      )}

      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(pageButtonClass, "hover:bg-accent hover:text-accent-foreground")}
      >
        ←
      </button>

      {pages.map((p, i) => {
        if (p === ELLIPSIS) {
          return (
            <span
              key={`ellipsis-${i}`}
              aria-hidden="true"
              className="inline-flex h-8 min-w-8 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          );
        }

        const pageNum = p as number;
        const isActive = pageNum === page;

        return (
          <button
            key={pageNum}
            type="button"
            aria-label={`Page ${pageNum}`}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onPageChange(pageNum)}
            className={cn(
              pageButtonClass,
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(pageButtonClass, "hover:bg-accent hover:text-accent-foreground")}
      >
        →
      </button>
    </nav>
  );
}
