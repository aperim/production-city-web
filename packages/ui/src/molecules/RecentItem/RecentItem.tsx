import { cn } from '../../lib/utils';

export interface RecentItemProps {
  /** Display label: "Tab — Workspace" format */
  label: string;
  /** Path to navigate to */
  path: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Navigation handler */
  onClick: (path: string) => void;
  /** Custom className */
  className?: string;
}

/** Format relative time (e.g., "2h ago", "3d ago") */
function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/**
 * Compact row for sidebar Recents section.
 * Shows label (tab — workspace) and relative timestamp.
 */
export function RecentItem({ label, path, timestamp, onClick, className }: RecentItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
        'min-h-[44px] hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'transition-colors duration-150',
        className,
      )}
    >
      <span className="truncate text-muted-foreground">{label}</span>
      <span className="shrink-0 text-xs text-muted-foreground/60">{formatRelativeTime(timestamp)}</span>
    </button>
  );
}
