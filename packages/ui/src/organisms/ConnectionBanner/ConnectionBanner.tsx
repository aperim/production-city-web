'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

/** Connection banner state */
type BannerState = "disconnected" | "reconnecting";

/** Props for the ConnectionBanner organism */
interface ConnectionBannerProps {
  /** Current banner state. Null or undefined hides the banner. */
  state?: BannerState | null;
  /** Custom message text */
  message?: string;
  /** Dismiss button label */
  dismissLabel?: string;
  /** Called when the banner is dismissed */
  onDismiss?: () => void;
  className?: string;
}

const DEFAULT_MESSAGES: Record<BannerState, string> = {
  disconnected: "Real-time updates unavailable. You may experience delays.",
  reconnecting: "Reconnecting to real-time updates...",
};

/**
 * ConnectionBanner organism -- full-width dismissible banner for disconnection.
 *
 * Shown when the WebSocket connection is lost. Non-blocking.
 * Dismissible with a close button. Re-shows if a new disconnection occurs.
 */
function ConnectionBanner({
  state,
  message,
  dismissLabel = "Dismiss",
  onDismiss,
  className,
}: ConnectionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const prevState = useRef(state);

  // Reset dismissed when state changes (e.g. new disconnection after dismiss)
  useEffect(() => {
    if (state && state !== prevState.current) {
      setDismissed(false);
    }
    prevState.current = state;
  }, [state]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  if (!state || dismissed) return null;

  const displayMessage = message ?? DEFAULT_MESSAGES[state];
  const isReconnecting = state === "reconnecting";

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2 text-sm border-b",
        isReconnecting
          ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
          : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
        className,
      )}
    >
      <span className="flex-1">{displayMessage}</span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label={dismissLabel}
        className="shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity duration-100"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export { ConnectionBanner };
export type { ConnectionBannerProps, BannerState };
