"use client";

import { cn } from "../../lib/utils";
import type {
  ContentBlock,
  Category,
  Tag,
  AnnouncementStatus,
  AnnouncementVisibility,
} from "../../types/announcements";
import { ContentBlockRenderer } from "../../molecules/ContentBlockRenderer/ContentBlockRenderer";
import { CategoryTag } from "../../atoms/CategoryTag/CategoryTag";

/** Announcement data for the preview canvas. */
export interface PreviewAnnouncement {
  id: string;
  title: string;
  summary: string;
  contentBlocks: ContentBlock[];
  categories: Category[];
  tags: Tag[];
  status: AnnouncementStatus;
  visibility: AnnouncementVisibility;
  author: { name: string };
  publishedAt: string;
  lastEditedAt: string | null;
}

/** Delivery statistics. */
export interface DeliveryStats {
  sent: number;
  delivered: number;
  failed: number;
}

/** Props for AnnouncementPreviewCanvas. */
export interface AnnouncementPreviewCanvasProps {
  /** Announcement data. */
  announcement: PreviewAnnouncement;
  /** Delivery statistics (only for published). */
  deliveryStats?: DeliveryStats;
  /** Edit callback. */
  onEdit: () => void;
  /** Publish callback. */
  onPublish: () => void;
  /** Unpublish callback. */
  onUnpublish: () => void;
  /** Archive callback. */
  onArchive: () => void;
  /** Permission check. */
  hasPermission: (permission: string) => boolean;
  /** Loading state. */
  loading?: boolean;
  /** Custom className. */
  className?: string;
}

/**
 * Full-canvas announcement preview with delivery stats and action buttons.
 *
 * Permission checks: Publish requires announcement:publish, Archive requires announcement:delete.
 *
 * @see Issue #443
 */
export function AnnouncementPreviewCanvas({
  announcement,
  deliveryStats,
  onEdit,
  onPublish,
  onUnpublish,
  onArchive,
  hasPermission,
  loading = false,
  className,
}: AnnouncementPreviewCanvasProps) {
  if (loading) {
    return (
      <div className={cn("flex flex-col gap-4 p-4 max-w-3xl", className)} role="status">
        <div className="h-8 w-64 rounded bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-32 w-full rounded bg-muted animate-pulse" />
        <span className="sr-only">Loading preview...</span>
      </div>
    );
  }

  const canPublish = hasPermission("announcement:publish");
  const canArchive = hasPermission("announcement:delete");

  return (
    <div className={cn("flex flex-col gap-6 p-4 max-w-3xl", className)}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">{announcement.title}</h2>
        <p className="text-sm text-muted-foreground mb-3">{announcement.summary}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{announcement.author.name}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={announcement.publishedAt}>
            {formatDate(announcement.publishedAt)}
          </time>
          {announcement.lastEditedAt && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>Edited {formatDate(announcement.lastEditedAt)}</span>
            </>
          )}
        </div>
      </div>

      {/* Categories and tags */}
      <div className="flex flex-wrap gap-1">
        {announcement.categories.map((cat) => (
          <CategoryTag key={cat.id} name={cat.name} slug={cat.slug} />
        ))}
        {announcement.tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Content blocks */}
      <div className="flex flex-col gap-4">
        {announcement.contentBlocks.map((block) => (
          <ContentBlockRenderer key={block.id} block={block} />
        ))}
      </div>

      {/* Delivery stats */}
      {deliveryStats && (
        <div className="flex gap-4 border-t border-border pt-4">
          <StatCard label="Sent" value={deliveryStats.sent} />
          <StatCard label="Delivered" value={deliveryStats.delivered} />
          <StatCard label="Failed" value={deliveryStats.failed} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={onEdit}
          className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors duration-100"
        >
          Edit
        </button>
        {announcement.status === "draft" && canPublish && (
          <button
            type="button"
            onClick={onPublish}
            className="rounded border border-primary/50 bg-primary/10 px-3 py-1.5 text-sm text-primary hover:bg-primary/20 transition-colors duration-100"
          >
            Publish
          </button>
        )}
        {announcement.status === "published" && canPublish && (
          <button
            type="button"
            onClick={onUnpublish}
            className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted transition-colors duration-100"
          >
            Unpublish
          </button>
        )}
        {canArchive && (
          <button
            type="button"
            onClick={onArchive}
            className="rounded border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            Archive
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold text-foreground">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
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
