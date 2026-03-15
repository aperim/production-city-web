"use client";

import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { AdminAnnouncement, PaginationState } from "../../types/announcements";
import { AnnouncementStatusBadge } from "../../atoms/AnnouncementStatusBadge/AnnouncementStatusBadge";
import { VisibilityBadge } from "../../atoms/VisibilityBadge/VisibilityBadge";
import { Pagination } from "../../molecules/Pagination/Pagination";

/** Props for the AdminAnnouncementTable organism. */
export interface AdminAnnouncementTableProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Announcement data. */
  announcements: AdminAnnouncement[];
  /** Edit handler. */
  onEdit: (id: string) => void;
  /** Publish handler. */
  onPublish: (id: string) => void;
  /** Archive handler. */
  onArchive: (id: string) => void;
  /** Pagination state. */
  pagination: PaginationState;
  /** Loading state. */
  loading?: boolean;
}

/**
 * Admin data table for managing announcements.
 *
 * Shows title, status, visibility, date, and action buttons.
 */
function AdminAnnouncementTable({
  announcements,
  onEdit,
  onPublish,
  onArchive,
  pagination,
  loading = false,
  className,
  ...props
}: AdminAnnouncementTableProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Visibility
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border animate-pulse" aria-busy="true">
                  <td className="px-4 py-3"><div className="h-4 w-40 rounded bg-muted" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-muted" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-14 rounded bg-muted" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-muted" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-muted ml-auto" /></td>
                </tr>
              ))}

            {!loading && announcements.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No announcements found.
                </td>
              </tr>
            )}

            {!loading &&
              announcements.map((a) => (
                <tr key={a.id} className="border-b border-border hover:bg-muted/10 transition-colors duration-100">
                  <td className="px-4 py-3 font-medium text-foreground max-w-xs truncate">
                    {a.title}
                  </td>
                  <td className="px-4 py-3">
                    <AnnouncementStatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    <VisibilityBadge visibility={a.visibility} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <time dateTime={a.publishedAt}>
                      {formatDate(a.publishedAt)}
                    </time>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(a.id)}
                        className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
                      >
                        Edit
                      </button>
                      {a.status === "draft" && (
                        <button
                          type="button"
                          onClick={() => onPublish(a.id)}
                          className="rounded border border-primary/50 bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20 transition-colors duration-150"
                        >
                          Publish
                        </button>
                      )}
                      {a.status === "published" && (
                        <button
                          type="button"
                          onClick={() => onArchive(a.id)}
                          className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
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

export { AdminAnnouncementTable };
