'use client';

import { type ReactNode } from "react";
import { NotificationItem } from "../../molecules/NotificationItem/NotificationItem";
import { cn } from "../../lib/utils";

/** A single notification entry for the panel */
interface NotificationEntry {
  id: string;
  message: ReactNode;
  timestamp?: string;
  /** ISO 8601 datetime for accessible absolute time */
  timestampIso?: string;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

/** Props for the NotificationPanel organism */
interface NotificationPanelProps {
  /** List of notifications to display */
  notifications: NotificationEntry[];
  /** Called when "Mark all as read" is clicked */
  onMarkAllRead?: () => void;
  /** Called when a notification is selected */
  onSelect?: (id: string) => void;
  /** Whether the panel is in a loading state */
  loading?: boolean;
  /** Panel title */
  title?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Mark all read label */
  markAllReadLabel?: string;
  className?: string;
}

/**
 * NotificationPanel organism -- scrollable list of notifications with header.
 *
 * Shows a header with title and "Mark all as read" action,
 * a list of NotificationItem molecules, and empty/loading states.
 */
function NotificationPanel({
  notifications,
  onMarkAllRead,
  onSelect,
  loading = false,
  title = "Notifications",
  emptyMessage = "No notifications",
  markAllReadLabel = "Mark all as read",
  className,
}: NotificationPanelProps) {
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      className={cn("flex flex-col w-80 max-h-96 bg-card border border-border rounded-sm shadow-sm", className)}
      role="region"
      aria-label={title}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {hasUnread && onMarkAllRead && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs text-primary hover:text-primary/80 transition-colors duration-100"
          >
            {markAllReadLabel}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto" role="list">
        {loading ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              message={n.message}
              timestamp={n.timestamp}
              timestampIso={n.timestampIso}
              read={n.read}
              actionLabel={n.actionLabel}
              onAction={n.onAction}
              onSelect={onSelect ? () => onSelect(n.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}

export { NotificationPanel };
export type { NotificationPanelProps, NotificationEntry };
