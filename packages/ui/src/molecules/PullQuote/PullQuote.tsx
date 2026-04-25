import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Props for the PullQuote molecule */
export interface PullQuoteProps {
  /** Quote text. Can include inline elements (strong, em). */
  children: ReactNode;
  /** Optional attribution (person, title, etc.). */
  attribution?: string;
  /** Wide variant: allows longer max-width (28ch vs 22ch). */
  wide?: boolean;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * PullQuote molecule — large serif pull quote.
 *
 * Maps to reference `.pullquote` pattern.
 * Used on the home page "First site advantage" section.
 */
export function PullQuote({ children, attribution, wide = false, className }: PullQuoteProps) {
  return (
    <figure className={cn("m-0", className)}>
      <blockquote
        style={{
          fontFamily: "var(--serif)",
          fontSize: "clamp(32px,4vw,64px)",
          fontWeight: 300,
          lineHeight: 1.1,
          letterSpacing: "-0.015em",
          maxWidth: wide ? "28ch" : "22ch",
          textWrap: "balance",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </blockquote>
      {attribution && (
        <figcaption
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--muted-ink)",
            marginTop: "24px",
          }}
        >
          {attribution}
        </figcaption>
      )}
    </figure>
  );
}
