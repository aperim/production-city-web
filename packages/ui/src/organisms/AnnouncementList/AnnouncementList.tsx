"use client";

import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { AnnouncementSummary, Category, PaginationState } from "../../types/announcements";
import { CategoryTag } from "../../atoms/CategoryTag/CategoryTag";
import { AnnouncementCard } from "../../molecules/AnnouncementCard/AnnouncementCard";
import { Pagination } from "../../molecules/Pagination/Pagination";

/** Props for the AnnouncementList organism. */
export interface AnnouncementListProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Announcements to display. */
  announcements: AnnouncementSummary[];
  /** Available categories for filtering. */
  categories: Category[];
  /** Currently active category slug (null = show all). */
  activeCategory: string | null;
  /** Filter handler. */
  onCategoryFilter: (slug: string | null) => void;
  /** Pagination state. */
  pagination: PaginationState;
  /** Loading state — shows skeleton cards. */
  loading?: boolean;
  /** Error message. */
  error?: string;
}

/**
 * List/grid of announcement cards with category filtering and pagination.
 *
 * Loading state shows skeleton cards (not a generic spinner) per acceptance criteria.
 */
function AnnouncementList({
  announcements,
  categories,
  activeCategory,
  onCategoryFilter,
  pagination,
  loading = false,
  error,
  className,
  ...props
}: AnnouncementListProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Category filter bar */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-6" role="group" aria-label="Filter by category">
          <CategoryTag
            name="All"
            slug=""
            active={activeCategory === null}
            onClick={() => onCategoryFilter(null)}
          />
          {categories.map((cat) => (
            <CategoryTag
              key={cat.id}
              name={cat.name}
              slug={cat.slug}
              active={activeCategory === cat.slug}
              onClick={() => onCategoryFilter(cat.slug)}
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-6 text-center" role="alert">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AnnouncementCard
              key={i}
              title=""
              summary=""
              slug=""
              categories={[]}
              tags={[]}
              author={{ name: "" }}
              publishedAt=""
              visibility="public"
              loading
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && announcements.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">No announcements found.</p>
        </div>
      )}

      {/* Announcement grid */}
      {!loading && !error && announcements.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((a) => (
              <AnnouncementCard
                key={a.id}
                title={a.title}
                summary={a.summary}
                slug={a.slug}
                categories={a.categories}
                tags={a.tags}
                author={a.author}
                publishedAt={a.publishedAt}
                visibility={a.visibility}
              />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { AnnouncementList };
