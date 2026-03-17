'use client';

import { cn } from '../../lib/utils';
import { AttentionItem } from '../../molecules/AttentionItem/AttentionItem';
import type { AttentionPriority } from '../../atoms/AttentionDot/AttentionDot';

export interface InboxFeedItem {
  id: string;
  type: string;
  summary: string;
  workspace: string | null;
  sourceUrl: string;
  priority: AttentionPriority;
  read: boolean;
  dismissed: boolean;
  actionable: boolean;
  createdAt: string;
}

export interface InboxFilters {
  type?: string;
  workspace?: string;
  read?: boolean;
}

export interface InboxFeedProps {
  items: InboxFeedItem[];
  loading: boolean;
  totalUnread: number;
  totalActionable: number;
  hasMore: boolean;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onLoadMore: () => void;
  onNavigate: (path: string) => void;
  activeFilters: InboxFilters;
  onFilterChange: (filters: InboxFilters) => void;
  className?: string;
}

/**
 * Inbox feed with filtering, mark-read/dismiss, and pagination.
 */
export function InboxFeed({
  items,
  loading,
  totalUnread,
  totalActionable,
  hasMore,
  onMarkRead,
  onDismiss,
  onLoadMore,
  onNavigate,
  activeFilters,
  onFilterChange,
  className,
}: InboxFeedProps) {
  if (loading && items.length === 0) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} data-testid="inbox-skeleton" className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="inbox-type-filter" className="sr-only">Filter by type</label>
          <select
            id="inbox-type-filter"
            aria-label="Filter by type"
            value={activeFilters.type ?? ''}
            onChange={(e) => onFilterChange({ ...activeFilters, type: e.target.value || undefined })}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="">All types</option>
            <option value="approval">Approval</option>
            <option value="mention">Mention</option>
            <option value="update">Update</option>
            <option value="system">System</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="inbox-workspace-filter" className="sr-only">Filter by workspace</label>
          <select
            id="inbox-workspace-filter"
            aria-label="Filter by workspace"
            value={activeFilters.workspace ?? ''}
            onChange={(e) => onFilterChange({ ...activeFilters, workspace: e.target.value || undefined })}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="">All workspaces</option>
            <option value="productions">Productions</option>
            <option value="finance">Finance</option>
            <option value="facilities">Facilities</option>
            <option value="people">People</option>
            <option value="events">Events</option>
          </select>
        </div>
        <span className="text-xs text-muted-foreground">
          {totalUnread} unread &middot; {totalActionable} actionable
        </span>
      </div>

      {/* Item list */}
      {items.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No items in your inbox.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <AttentionItem
              key={item.id}
              id={item.id}
              type={item.type}
              summary={item.summary}
              workspace={item.workspace}
              sourceUrl={item.sourceUrl}
              priority={item.priority}
              read={item.read}
              onMarkRead={onMarkRead}
              onDismiss={onDismiss}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loading}
          className="self-center rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent/50 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
