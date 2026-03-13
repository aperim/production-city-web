import { cn } from '../../lib/utils';

/** Props for the AuditLogEntry molecule */
export interface AuditLogEntryProps {
  /**
   * Action description (e.g. "Logged in", "Changed role").
   */
  action: string;
  /**
   * Name of the actor who performed the action.
   */
  actorName?: string;
  /**
   * Name of the subject the action was performed on.
   */
  subjectName?: string;
  /**
   * Additional details about the event.
   */
  details?: string;
  /**
   * When the event occurred.
   */
  timestamp: Date;
  /**
   * IP address of the actor.
   */
  ipAddress?: string;
  /**
   * Additional class names.
   */
  className?: string;
}

function formatTimestamp(date: Date): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return String(date);
  }
}

/**
 * AuditLogEntry molecule — single audit log item display.
 *
 * Designed for dual usage: standalone in activity feeds and as a
 * DataTable custom row renderer. All user-supplied text is rendered
 * via JSX text escaping. Long text is truncated with title attributes.
 */
export function AuditLogEntry({
  action,
  actorName,
  subjectName,
  details,
  timestamp,
  ipAddress,
  className,
}: AuditLogEntryProps) {
  return (
    <div className={cn('flex flex-col gap-1 py-2', className)}>
      <div className="flex items-baseline gap-1.5 text-sm">
        {actorName && (
          <span className="font-medium text-foreground truncate max-w-32" title={actorName}>
            {actorName}
          </span>
        )}
        <span className="text-muted-foreground">{action}</span>
        {subjectName && (
          <span className="font-medium text-foreground truncate max-w-32" title={subjectName}>
            {subjectName}
          </span>
        )}
      </div>
      {details && (
        <p className="text-xs text-muted-foreground truncate max-w-80" title={details}>
          {details}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <time dateTime={timestamp.toISOString()}>
          {formatTimestamp(timestamp)}
        </time>
        {ipAddress && (
          <span className="font-mono">{ipAddress}</span>
        )}
      </div>
    </div>
  );
}
