import { cn } from "../../lib/utils";

/** A single row in the spec table */
export interface SpecRow {
  /** Spec label (e.g., "Floor area"). */
  label: string;
  /** Spec value (e.g., "2,025 m² · 21,797 ft²"). */
  value: string;
}

/** Props for the SpecTable molecule */
export interface SpecTableProps {
  /** Rows of key-value specifications. */
  rows: SpecRow[];
  /** Additional CSS classes. */
  className?: string;
}

/**
 * SpecTable molecule — key/value pair table for technical facility specifications.
 *
 * Maps to reference `.spec` / `.spec-row` pattern.
 * Used on facility detail pages.
 */
export function SpecTable({ rows, className }: SpecTableProps) {
  return (
    <dl className={cn("", className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid items-baseline"
          style={{
            gridTemplateColumns: "1fr 2fr",
            gap: "24px",
            padding: "14px 0",
            borderBottom: "1px solid var(--rule-paper)",
          }}
        >
          <dt
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted-paper)",
            }}
          >
            {row.label}
          </dt>
          <dd
            style={{
              fontSize: "14px",
              margin: 0,
            }}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
