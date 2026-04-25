import { cn } from "../../lib/utils";

/** A single operating pillar item */
export interface OperatingPillarItem {
  /** Roman numeral or short label (e.g., "i", "ii", "iii"). */
  numeral: string;
  /** Pillar heading. */
  heading: string;
  /** Pillar body text. */
  body: string;
}

/** Props for the OperatingPillars organism */
export interface OperatingPillarsProps {
  /** List of pillars to render. */
  pillars: OperatingPillarItem[];
  /**
   * Accent color for the numerals.
   * Defaults to the brand accent red (`var(--accent)`).
   * Pass `"var(--ochre)"` for First Nations contexts.
   */
  accentColor?: string;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * OperatingPillars organism — numbered list of principle/pillar items with roman
 * numeral labels.
 *
 * Maps to reference `.op-pillars` / `.op-pillar` pattern.
 * Used on the home page operating model section and the company page.
 */
export function OperatingPillars({
  pillars,
  accentColor = "var(--accent)",
  className,
}: OperatingPillarsProps) {
  return (
    <div
      className={cn("flex flex-col", className)}
      style={{ borderTop: "1px solid rgba(247,245,240,0.18)" }}
    >
      {pillars.map((pillar) => (
        <div
          key={pillar.numeral}
          className="grid items-start"
          style={{
            gridTemplateColumns: "48px 1fr",
            gap: "16px",
            padding: "22px 0",
            borderBottom: "1px solid rgba(247,245,240,0.12)",
          }}
        >
          {/* Roman numeral */}
          <span
            aria-hidden="true"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: "0.22em",
              color: accentColor,
              textTransform: "uppercase",
              paddingTop: "4px",
            }}
          >
            {pillar.numeral}
          </span>

          {/* Content */}
          <div>
            <h4
              style={{
                fontFamily: "var(--sans)",
                fontSize: "16px",
                fontWeight: 500,
                letterSpacing: "0.01em",
                margin: "0 0 8px",
                color: "var(--paper)",
              }}
            >
              {pillar.heading}
            </h4>
            <p
              style={{
                fontSize: "14.5px",
                lineHeight: 1.55,
                color: "var(--muted-ink)",
                margin: 0,
                maxWidth: "46ch",
              }}
            >
              {pillar.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
