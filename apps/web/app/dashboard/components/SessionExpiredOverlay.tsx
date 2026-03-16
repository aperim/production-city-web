"use client";

/**
 * Session expired overlay — shown when the user's session is invalidated.
 *
 * Covers the dashboard with a modal overlay, preserving current URL for
 * post-sign-in redirect. Prevents any dashboard interaction while expired.
 *
 * @see Issue #353
 */

export interface SessionExpiredOverlayProps {
  /** Message to display */
  message: string;
  /** URL to redirect to after sign-in */
  returnUrl: string;
}

export function SessionExpiredOverlay({
  message,
  returnUrl,
}: SessionExpiredOverlayProps) {
  const loginUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      aria-describedby="session-expired-desc"
    >
      <div className="rounded-sm border border-border bg-card p-6 shadow-lg max-w-sm text-center">
        <p
          id="session-expired-title"
          className="text-sm font-medium text-foreground"
        >
          Session Expired
        </p>
        <p
          id="session-expired-desc"
          className="mt-2 text-sm text-muted-foreground"
        >
          {message}
        </p>
        <a
          href={loginUrl}
          className="mt-4 inline-block rounded-sm bg-foreground px-4 py-2 text-sm text-background hover:opacity-90 transition-opacity duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Sign In
        </a>
      </div>
    </div>
  );
}
