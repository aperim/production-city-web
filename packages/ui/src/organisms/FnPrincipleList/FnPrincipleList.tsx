import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** A single First Nations principle item */
export interface FnPrincipleItem {
  /** Two-digit number string (e.g., "01", "02"). */
  number: string;
  /**
   * Principle content. Can include inline elements.
   * Strong elements will be styled in ochre.
   */
  children: ReactNode;
}

/** Props for the FnPrincipleList organism */
export interface FnPrincipleListProps {
  /** Principle items to display. */
  items: FnPrincipleItem[];
  /** Additional CSS classes. */
  className?: string;
}

/**
 * FnPrincipleList organism — numbered list of First Nations principles
 * using ochre accent colour for numbers and strong text.
 *
 * Maps to reference `.fn-principle` pattern.
 * Used on the First Nations page "IP & data provenance" section.
 *
 * Note: strong elements within children are styled via CSS custom property
 * for ochre color — apply `style={{ color: "var(--ochre)", fontWeight: 500 }}`
 * directly on strong tags in the content.
 */
export function FnPrincipleList({ items, className }: FnPrincipleListProps) {
  return (
    <div className={cn("", className)}>
      {items.map((item) => (
        <div
          key={item.number}
          className="grid items-baseline"
          style={{
            padding: "24px 0",
            borderBottom: "1px solid var(--rule-paper)",
            gridTemplateColumns: "40px 1fr",
            gap: "24px",
          }}
        >
          {/* Number */}
          <span
            aria-hidden="true"
            style={{
              fontFamily: "var(--mono)",
              fontSize: "12px",
              letterSpacing: "0.14em",
              color: "var(--ochre)",
            }}
          >
            {item.number}
          </span>

          {/* Content */}
          <p
            style={{
              margin: 0,
              fontFamily: "var(--serif)",
              fontSize: "clamp(18px,1.6vw,22px)",
              lineHeight: 1.45,
              maxWidth: "42ch",
            }}
          >
            {item.children}
          </p>
        </div>
      ))}
    </div>
  );
}
