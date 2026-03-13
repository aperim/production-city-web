import { cn } from "../../lib/utils";

/** Props for the ForwardLookingDisclaimer organism */
export interface ForwardLookingDisclaimerProps {
  /** Disclaimer text (i18n). */
  text: string;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * ForwardLookingDisclaimer organism — subtle, reusable notice for pages
 * containing forward-looking statements.
 *
 * Minimal styling, not decorative. Placed at bottom of relevant pages.
 */
export function ForwardLookingDisclaimer({
  text,
  className,
}: ForwardLookingDisclaimerProps) {
  return (
    <aside
      className={cn(
        "border-t border-border py-4 text-xs text-muted-foreground",
        className,
      )}
      aria-label="Disclaimer"
    >
      <p>{text}</p>
    </aside>
  );
}
