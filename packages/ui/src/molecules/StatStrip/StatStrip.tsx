import { cn } from "../../lib/utils";

/** A single statistic in the strip */
export interface StatItem {
  /** The large number or value (e.g., "19", "2"). */
  value: string;
  /** Optional unit appended inline in smaller text (e.g., " loop"). */
  unit?: string;
  /** Label below the number (e.g., "stations from idea to audience"). */
  label: string;
}

/** Props for the StatStrip molecule */
export interface StatStripProps {
  /** Array of stats to display. */
  stats: StatItem[];
  /** Additional CSS classes. */
  className?: string;
}

/**
 * StatStrip molecule — a horizontal grid of large-number statistics with labels.
 *
 * Maps to reference `.op-stats` / `.op-stat` pattern.
 * Used on the home page below the operating pillars section.
 */
export function StatStrip({ stats, className }: StatStripProps) {
  return (
    <div
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        borderTop: "1px solid rgba(247,245,240,0.18)",
        borderBottom: "1px solid rgba(247,245,240,0.18)",
      }}
      role="list"
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          role="listitem"
          style={{
            padding: "20px 16px 20px 0",
            borderRight:
              idx < stats.length - 1
                ? "1px solid rgba(247,245,240,0.12)"
                : "none",
          }}
        >
          {/* Large number */}
          <div
            aria-hidden="true"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "44px",
              fontWeight: 300,
              lineHeight: 1.0,
              letterSpacing: "-0.015em",
              color: "var(--paper)",
            }}
          >
            {stat.value}
            {stat.unit && (
              <span
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: "16px",
                  fontWeight: 400,
                  letterSpacing: 0,
                  color: "var(--muted-ink)",
                }}
              >
                {stat.unit}
              </span>
            )}
          </div>
          {/* Label */}
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted-ink)",
              marginTop: "8px",
            }}
          >
            {stat.label}
          </div>
          {/* Screen-reader text */}
          <span className="sr-only">
            {stat.value}
            {stat.unit} {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
