import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type {
  AnnouncementVisibility,
  Category,
  Tag,
} from "../../types/announcements";
import { VisibilityBadge } from "../../atoms/VisibilityBadge/VisibilityBadge";
import { CategoryTag } from "../../atoms/CategoryTag/CategoryTag";

/** Props for the AnnouncementCard molecule. */
export interface AnnouncementCardProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Announcement title. */
  title: string;
  /** Short excerpt. */
  summary: string;
  /** URL slug. */
  slug: string;
  /** Assigned categories. */
  categories: Category[];
  /** Assigned tags. */
  tags: Tag[];
  /** Author information. */
  author: { name: string };
  /** ISO date of publication. */
  publishedAt: string;
  /** Visibility scope. */
  visibility: AnnouncementVisibility;
  /** Whether the card is in a loading/skeleton state. */
  loading?: boolean;
}

/**
 * Card preview of an announcement for listing pages.
 *
 * Shows title, summary, categories, author, date, and visibility badge.
 * Supports a skeleton loading state.
 */
function AnnouncementCard({
  title,
  summary,
  slug,
  categories,
  tags,
  author,
  publishedAt,
  visibility,
  loading = false,
  className,
  ...props
}: AnnouncementCardProps) {
  if (loading) {
    return (
      <article
        className={cn(
          "rounded-lg border border-border bg-card p-4 animate-pulse",
          className,
        )}
        aria-busy="true"
        {...props}
      >
        <div className="h-5 w-3/4 rounded bg-muted mb-3" />
        <div className="h-4 w-full rounded bg-muted mb-2" />
        <div className="h-4 w-2/3 rounded bg-muted mb-4" />
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded bg-muted" />
          <div className="h-5 w-16 rounded bg-muted" />
        </div>
      </article>
    );
  }

  const formattedDate = formatDate(publishedAt);

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:border-muted-foreground/30",
        className,
      )}
      data-slug={slug}
      {...props}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
          {title}
        </h3>
        <VisibilityBadge visibility={visibility} className="shrink-0" />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {summary}
      </p>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {categories.map((cat) => (
            <CategoryTag key={cat.id} name={cat.name} slug={cat.slug} />
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center rounded-md bg-muted/50 px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{author.name}</span>
        <span aria-hidden="true">&middot;</span>
        <time dateTime={publishedAt}>{formattedDate}</time>
      </div>
    </article>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export { AnnouncementCard };
