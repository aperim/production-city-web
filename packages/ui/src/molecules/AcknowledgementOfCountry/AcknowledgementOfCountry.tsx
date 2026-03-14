import { useId } from "react";
import { cn } from "../../lib/utils";

/** Props for the AcknowledgementOfCountry molecule */
export interface AcknowledgementOfCountryProps {
  /** Section heading text (i18n). */
  heading: string;
  /** Acknowledgement body text (i18n). */
  text: string;
  /** Compact mode for use in footer. */
  compact?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * AcknowledgementOfCountry — shared component for footer and page body.
 * Finding #22: Must be a reusable shared component.
 */
export function AcknowledgementOfCountry({
  heading,
  text,
  compact = false,
  className,
}: AcknowledgementOfCountryProps) {
  const headingId = useId();

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className={cn(
        compact ? "py-2" : "border-t border-border py-8",
        className,
      )}
    >
      <h2
        id={headingId}
        className={cn(
          "font-semibold text-foreground",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {heading}
      </h2>
      <p
        className={cn(
          "text-muted-foreground",
          compact ? "mt-1 text-xs" : "mt-2 text-sm",
        )}
      >
        {text}
      </p>
    </section>
  );
}
