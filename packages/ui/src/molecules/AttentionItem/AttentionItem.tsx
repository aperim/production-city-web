'use client';

import { cn } from '../../lib/utils';
import { AttentionDot, type AttentionPriority } from '../../atoms/AttentionDot/AttentionDot';

export interface AttentionItemProps {
  /** Unique item ID */
  id: string;
  /** Item type for categorization */
  type: string;
  /** Human-readable summary text */
  summary: string;
  /** Workspace the item belongs to (null for system items) */
  workspace: string | null;
  /** URL to navigate to when clicked */
  sourceUrl: string;
  /** Priority level */
  priority: AttentionPriority;
  /** Whether item has been read */
  read: boolean;
  /** Callback when mark-read is clicked */
  onMarkRead: (id: string) => void;
  /** Callback when dismiss is clicked */
  onDismiss: (id: string) => void;
  /** Navigation callback */
  onNavigate: (url: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Single inbox/attention item with priority dot, summary, and action buttons.
 */
export function AttentionItem({
  id,
  summary,
  sourceUrl,
  priority,
  read,
  onMarkRead,
  onDismiss,
  onNavigate,
  className,
}: AttentionItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border p-3',
        !read && 'bg-accent/10',
        className,
      )}
    >
      <AttentionDot priority={priority} className="mt-1.5" />
      <button
        type="button"
        onClick={() => onNavigate(sourceUrl)}
        className="flex-1 text-left text-sm hover:underline"
      >
        {summary}
      </button>
      <div className="flex shrink-0 items-center gap-1">
        {!read && (
          <button
            type="button"
            aria-label="Mark as read"
            onClick={() => onMarkRead(id)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => onDismiss(id)}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
