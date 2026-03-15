"use client";

/**
 * LocaleSuggestion molecule — non-modal banner suggesting the user's preferred locale.
 *
 * Shows when the Worker has set a `pc-locale-suggestion` cookie and the detected
 * locale differs from the current page locale.
 *
 * Accessibility (Finding #23):
 * - role="status" for screen reader announcement
 * - Escape key dismisses
 * - Non-modal — does not trap focus or block underlying content
 * - Fixed position with z-index below modals, above page content
 *
 * @see Issue #280
 */

import { useCallback, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { LOCALE_META } from "../../lib/i18n-constants";

export interface LocaleSuggestionProps {
  /** The locale suggested by the server (from pc-locale-suggestion cookie). Null means no suggestion. */
  suggestedLocale: string | null;
  /** The current page locale. */
  currentLocale: string;
  /** Whether the user has previously dismissed the suggestion. */
  dismissed?: boolean;
  /** Called when the user accepts the suggestion. Receives the suggested locale code. */
  onAccept: (locale: string) => void;
  /** Called when the user dismisses the suggestion. */
  onDismiss: () => void;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * Get the native language name for a locale code.
 */
function getNativeName(locale: string): string {
  const meta = LOCALE_META.find((m) => m.code === locale);
  return meta?.nativeName ?? locale;
}

/**
 * LocaleSuggestion — non-intrusive banner for locale switching.
 */
export function LocaleSuggestion({
  suggestedLocale,
  currentLocale,
  dismissed = false,
  onAccept,
  onDismiss,
  className,
}: LocaleSuggestionProps) {
  // Don't show if no suggestion, same locale, or already dismissed
  if (!suggestedLocale || suggestedLocale === currentLocale || dismissed) {
    return null;
  }

  const nativeName = getNativeName(suggestedLocale);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    },
    [onDismiss],
  );

  return (
    <div
      role="status"
      aria-live="polite"
      onKeyDown={handleKeyDown}
      className={cn(
        "fixed bottom-4 start-4 end-4 z-40",
        "mx-auto max-w-lg",
        "flex items-center gap-3 px-4 py-3",
        "rounded-md border border-border bg-background text-sm text-foreground shadow-sm",
        className,
      )}
    >
      <span className="flex-1">
        This page is available in{" "}
        <strong>{nativeName}</strong>.
      </span>
      <button
        type="button"
        onClick={() => onAccept(suggestedLocale)}
        aria-label={`Switch to ${nativeName}`}
        className={cn(
          "inline-flex items-center px-3 py-1.5 text-sm font-medium",
          "rounded-md bg-primary text-primary-foreground",
          "transition-colors duration-150 hover:bg-primary/90",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        Switch
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss locale suggestion"
        className={cn(
          "inline-flex items-center px-2 py-1.5 text-sm text-muted-foreground",
          "rounded-md",
          "transition-colors duration-150 hover:text-foreground",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        )}
      >
        ✕
      </button>
    </div>
  );
}
