import { cn } from "../../lib/utils";
import { sanitizeHref } from "../../atoms/Link/Link";

/** A single audience card */
export interface AudienceCard {
  /** Roman numeral (e.g., "I", "II"). */
  numeral: string;
  /** Audience type heading (e.g., "For producers"). */
  heading: string;
  /** One-sentence description. */
  description: string;
  /** Link destination. */
  href: string;
  /** Link label text (e.g., "Enter"). */
  linkLabel?: string;
}

/** Props for the AudienceGrid organism */
export interface AudienceGridProps {
  /** Audience cards to display. */
  cards: AudienceCard[];
  /** Additional CSS classes. */
  className?: string;
}

/**
 * AudienceGrid organism — horizontal grid of audience-type cards with roman numerals.
 *
 * Maps to reference `.aud-grid` / `.aud-card` pattern.
 * Used on the home page "Who we work with" section.
 * Each card links to an audience-specific entry page.
 */
export function AudienceGrid({ cards, className }: AudienceGridProps) {
  return (
    <div
      className={cn("grid", className)}
      style={{ gridTemplateColumns: `repeat(${cards.length}, 1fr)` }}
    >
      {cards.map((card) => {
        const href = sanitizeHref(card.href);
        return (
          <a
            key={card.numeral}
            href={href}
            className={cn(
              "block transition-colors duration-250",
              "hover:bg-[var(--black)] hover:text-[var(--paper)]",
            )}
            style={{
              padding: "clamp(28px,3vw,48px) clamp(20px,2vw,32px)",
              borderRight: "1px solid var(--rule-paper)",
              display: "grid",
              gridTemplateRows: "auto 1fr auto",
              gap: "20px",
              minHeight: "340px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {/* Numeral */}
            <div
              aria-hidden="true"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                letterSpacing: "0.18em",
                color: "var(--muted-paper)",
              }}
            >
              {card.numeral}
            </div>

            {/* Heading + description */}
            <div>
              <h3
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(24px,2vw,34px)",
                  fontWeight: 300,
                  letterSpacing: "-0.01em",
                  margin: "0 0 12px",
                }}
              >
                {card.heading}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  margin: 0,
                  color: "var(--muted-paper)",
                  maxWidth: "26ch",
                }}
              >
                {card.description}
              </p>
            </div>

            {/* Link label */}
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {card.linkLabel ?? "Enter"} →
            </div>
          </a>
        );
      })}
    </div>
  );
}
