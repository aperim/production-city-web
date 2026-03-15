import { useCallback, useState } from "react";
import { cn } from "../../lib/utils";

/** Shape of a session item */
export interface SessionData {
  id: string;
  browser: string;
  os: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

/** Props for SessionList */
export interface SessionListProps {
  /** Array of active sessions */
  sessions: SessionData[];
  /** Called when user confirms revoking a session */
  onRevoke: (sessionId: string) => Promise<void>;
  /** Labels for i18n */
  labels?: {
    title?: string;
    currentSession?: string;
    revokeButton?: string;
    confirmRevoke?: string;
    cancelRevoke?: string;
    noOtherSessions?: string;
    sessionRevoked?: string;
    lastActive?: string;
    createdAt?: string;
    justNow?: string;
    minutesAgo?: string;
    hoursAgo?: string;
    daysAgo?: string;
    onDevice?: string;
    revoking?: string;
    revokeError?: string;
  };
  /** Additional class names */
  className?: string;
}

interface TimeLabels {
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;
}

function formatRelativeTime(dateStr: string, timeLabels: TimeLabels): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return timeLabels.justNow;
  if (diffMin < 60) return `${diffMin} ${timeLabels.minutesAgo}`;
  if (diffHr < 24) return `${diffHr} ${timeLabels.hoursAgo}`;
  return `${diffDay} ${timeLabels.daysAgo}`;
}

/**
 * SessionList molecule — displays active sessions with revoke action.
 * Current session is marked and cannot be revoked.
 */
export function SessionList({
  sessions,
  onRevoke,
  labels,
  className,
}: SessionListProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokedIds, setRevokedIds] = useState<Set<string>>(new Set());
  const [revokeErrorId, setRevokeErrorId] = useState<string | null>(null);

  const title = labels?.title ?? "Active sessions";
  const currentSessionLabel = labels?.currentSession ?? "Current session";
  const revokeButton = labels?.revokeButton ?? "Revoke";
  const confirmRevoke = labels?.confirmRevoke ?? "Confirm revoke?";
  const cancelRevoke = labels?.cancelRevoke ?? "Cancel";
  const noOtherSessions = labels?.noOtherSessions ?? "No other active sessions";
  const lastActiveLabel = labels?.lastActive ?? "Last active";
  const onDeviceLabel = labels?.onDevice ?? "on";
  const revokingLabel = labels?.revoking ?? "Revoking…";
  const revokeErrorLabel = labels?.revokeError ?? "Failed to revoke session";

  const timeLabels: TimeLabels = {
    justNow: labels?.justNow ?? "Just now",
    minutesAgo: labels?.minutesAgo ?? "min ago",
    hoursAgo: labels?.hoursAgo ?? "hr ago",
    daysAgo: labels?.daysAgo ?? "d ago",
  };

  const handleRevoke = useCallback(
    async (sessionId: string) => {
      setRevokingId(sessionId);
      setRevokeErrorId(null);
      try {
        await onRevoke(sessionId);
        setRevokedIds((prev) => new Set(prev).add(sessionId));
        setConfirmingId(null);
      } catch {
        setRevokeErrorId(sessionId);
        setConfirmingId(null);
      } finally {
        setRevokingId(null);
      }
    },
    [onRevoke],
  );

  const visibleSessions = sessions.filter((s) => !revokedIds.has(s.id));
  const otherSessions = visibleSessions.filter((s) => !s.isCurrent);

  return (
    <div className={cn("flex flex-col gap-3", className)} data-testid="session-list">
      <p className="text-sm font-medium text-foreground">{title}</p>

      <div className="divide-y divide-border rounded-sm border border-border">
        {visibleSessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "flex items-center justify-between px-3 py-2.5",
              session.isCurrent && "bg-muted/50",
            )}
            data-testid={`session-row-${session.id}`}
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">
                  {session.browser} {onDeviceLabel} {session.os}
                </span>
                {session.isCurrent && (
                  <span className="text-xs text-muted-foreground">
                    ({currentSessionLabel})
                  </span>
                )}
              </div>
              <span
                className="text-xs text-muted-foreground"
                title={new Date(session.lastActiveAt).toLocaleString()}
              >
                {lastActiveLabel}: {formatRelativeTime(session.lastActiveAt, timeLabels)}
              </span>
            </div>

            {!session.isCurrent && (
              <div className="flex items-center gap-2">
                {confirmingId === session.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRevoke(session.id)}
                      disabled={revokingId === session.id}
                      className="rounded-sm border border-destructive px-2 py-1 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors duration-150 disabled:opacity-50"
                      data-testid={`confirm-revoke-${session.id}`}
                    >
                      {revokingId === session.id ? revokingLabel : confirmRevoke}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      {cancelRevoke}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(session.id)}
                    className="rounded-sm border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
                    data-testid={`revoke-${session.id}`}
                  >
                    {revokeButton}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {revokeErrorId && (
        <p className="text-xs text-destructive" role="alert">
          {revokeErrorLabel}
        </p>
      )}

      {otherSessions.length === 0 && (
        <p className="text-xs text-muted-foreground">{noOtherSessions}</p>
      )}
    </div>
  );
}
