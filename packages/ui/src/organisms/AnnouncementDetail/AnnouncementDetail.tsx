import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { ContentBlock, Category, Tag } from "../../types/announcements";
import { CategoryTag } from "../../atoms/CategoryTag/CategoryTag";
import { ContentBlockRenderer } from "../../molecules/ContentBlockRenderer/ContentBlockRenderer";

/** Props for the AnnouncementDetail organism. */
export interface AnnouncementDetailProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Announcement title. */
  title: string;
  /** Short summary. */
  summary: string;
  /** Content blocks. */
  contentBlocks: ContentBlock[];
  /** Assigned categories. */
  categories: Category[];
  /** Assigned tags. */
  tags: Tag[];
  /** Author info. */
  author: { name: string };
  /** ISO date of publication. */
  publishedAt: string;
  /** ISO date of last edit (null if never edited). */
  lastEditedAt: string | null;
}

/**
 * Full announcement view with all content blocks rendered.
 */
function AnnouncementDetail({
  title,
  summary,
  contentBlocks,
  categories,
  tags,
  author,
  publishedAt,
  lastEditedAt,
  className,
  ...props
}: AnnouncementDetailProps) {
  return (
    <article
      className={cn("w-full max-w-3xl mx-auto", className)}
      {...props}
    >
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-base text-muted-foreground mb-4">{summary}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{author.name}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
          {lastEditedAt && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>
                Updated <time dateTime={lastEditedAt}>{formatDate(lastEditedAt)}</time>
              </span>
            </>
          )}
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {categories.map((cat) => (
              <CategoryTag key={cat.id} name={cat.name} slug={cat.slug} />
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
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
      </header>

      {/* Content blocks */}
      <div className="flex flex-col gap-6">
        {[...contentBlocks]
          .sort((a, b) => a.position - b.position)
          .map((block) => (
            <ContentBlockRenderer key={block.id} block={block} />
          ))}
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

export { AnnouncementDetail };
