import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/** Props for the SectionHead molecule */
export interface SectionHeadProps {
  /** Monospace label (e.g., "01 — Operating model"). */
  label: string;
  /** Section heading (h2). */
  heading: string;
  /** Optional lead paragraph. */
  lead?: string;
  /**
   * Optional additional content after the heading/lead (e.g., a CTA).
   */
  children?: ReactNode;
  /**
   * Override the border-top color. Use CSS custom property string.
   * Default uses `var(--rule)` (dark) / `var(--rule-paper)` (light page).
   * Pass `"var(--ochre)"` for First Nations sections.
   */
  borderColor?: string;
  /**
   * Override the label color.
   * Defaults to `var(--muted-ink)` (dark bg) or `var(--muted-paper)` (light bg).
   */
  labelColor?: string;
  /** Additional CSS classes. */
  className?: string;
}

/**
 * SectionHead molecule — two-column section header with label, heading, and optional lead.
 *
 * Maps to reference `.section-head` pattern.
 * Used at the top of every major section across all pages.
 */
export function SectionHead({
  label,
  heading,
  lead,
  children,
  borderColor = "var(--rule)",
  labelColor = "var(--muted-ink)",
  className,
}: SectionHeadProps) {
  return (
    <div
      className={cn("", className)}
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: "clamp(16px,2vw,48px)",
        paddingTop: "clamp(24px,3vw,48px)",
        borderTop: `1px solid ${borderColor}`,
        marginBottom: "clamp(32px,4vw,64px)",
      }}
    >
      {/* Left column: label */}
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "11px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: labelColor,
          paddingTop: "4px",
        }}
      >
        {label}
      </div>

      {/* Right column: heading + lead + optional children */}
      <div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(28px,3vw,48px)",
            fontWeight: 300,
            letterSpacing: "-0.015em",
            lineHeight: 1.1,
            margin: 0,
            maxWidth: "20ch",
          }}
        >
          {heading}
        </h2>
        {lead && (
          <p
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(16px,1.4vw,20px)",
              lineHeight: 1.5,
              color: "inherit",
              opacity: 0.82,
              marginTop: "clamp(16px,1.5vw,24px)",
              maxWidth: "52ch",
            }}
          >
            {lead}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
