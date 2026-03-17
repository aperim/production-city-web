'use client';

import { cn } from '../../lib/utils';
import { InboxFeed, type InboxFeedItem, type InboxFilters } from '../../organisms/InboxFeed/InboxFeed';

export interface InboxPageProps {
  items: InboxFeedItem[];
  loading: boolean;
  totalUnread: number;
  totalActionable: number;
  hasMore: boolean;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onLoadMore: () => void;
  onMarkAllRead: () => void;
  onNavigate: (path: string) => void;
  activeFilters: InboxFilters;
  onFilterChange: (filters: InboxFilters) => void;
  className?: string;
}

/**
 * Full inbox page template with header actions and feed.
 */
export function InboxPage({
  items,
  loading,
  totalUnread,
  totalActionable,
  hasMore,
  onMarkRead,
  onDismiss,
  onLoadMore,
  onMarkAllRead,
  onNavigate,
  activeFilters,
  onFilterChange,
  className,
}: InboxPageProps) {
  return (
    <div className={cn('flex flex-col gap-4 p-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Inbox</h1>
        {totalUnread > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-sm text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Feed */}
      <InboxFeed
        items={items}
        loading={loading}
        totalUnread={totalUnread}
        totalActionable={totalActionable}
        hasMore={hasMore}
        onMarkRead={onMarkRead}
        onDismiss={onDismiss}
        onLoadMore={onLoadMore}
        onNavigate={onNavigate}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
      />
    </div>
  );
}
