import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Props for the NotificationItem molecule */
interface NotificationItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Notification message text */
  message: ReactNode;
  /** Relative timestamp string (e.g. "2 min ago") */
  timestamp?: string;
  /** ISO 8601 datetime for the `<time>` element's `dateTime` and `title` attributes */
  timestampIso?: string;
  /** Whether the notification has been read */
  read?: boolean;
  /** Optional action button label */
  actionLabel?: string;
  /** Called when the action button is clicked */
  onAction?: () => void;
  /** Called when the entire item is clicked */
  onSelect?: () => void;
}

/**
 * NotificationItem molecule -- a single notification row.
 *
 * Shows message with timestamp, supports unread/read styling,
 * and an optional action button.
 */
function NotificationItem({
  message,
  timestamp,
  timestampIso,
  read = false,
  actionLabel,
  onAction,
  onSelect,
  className,
  ...props
}: NotificationItemProps) {
  return (
    <div
      role={onSelect ? "button" : "listitem"}
      className={cn(
        "flex items-start gap-2.5 px-3 py-2.5 border-b border-border last:border-b-0 cursor-default transition-colors duration-100",
        !read && "bg-accent/50",
        onSelect && "cursor-pointer hover:bg-accent/30",
        className,
      )}
      onClick={onSelect}
      onKeyDown={onSelect ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } } : undefined}
      tabIndex={onSelect ? 0 : undefined}
      {...props}
    >
      {!read && (
        <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm leading-snug", read ? "text-muted-foreground" : "text-foreground")}>
          {message}
        </p>
        {timestamp && (
          <time
            className="text-xs text-muted-foreground mt-0.5 block"
            dateTime={timestampIso}
            title={timestampIso}
          >
            {timestamp}
          </time>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAction(); }}
          className="shrink-0 text-xs font-medium text-primary hover:text-primary/80 transition-colors duration-100"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export { NotificationItem };
export type { NotificationItemProps };
