import { cn } from "../../lib/utils";

/** A single row in the services table */
export interface ServiceTableRow {
  /** Display number (e.g., "01", "02"). */
  number: string;
  /** Service name (rendered as h3, serif). */
  name: string;
  /** Short service description. */
  description: string;
}

/** Props for the ServiceTable organism */
export interface ServiceTableProps {
  /** Service rows to display. */
  rows: ServiceTableRow[];
  /** Additional CSS classes. */
  className?: string;
}

/**
 * ServiceTable organism — numbered list of services with name and description.
 *
 * Maps to reference `.service-table` / `.service-row` pattern.
 * Used on the services page.
 */
export function ServiceTable({ rows, className }: ServiceTableProps) {
  return (
    <div
      className={cn("", className)}
      style={{ borderTop: "1px solid var(--rule-paper)" }}
    >
      {rows.map((row) => (
        <div
          key={row.number}
          className="grid items-baseline"
          style={{
            gridTemplateColumns: "1fr 1.5fr",
            gap: "clamp(20px,3vw,56px)",
            padding: "clamp(20px,2.4vw,36px) 0",
            borderBottom: "1px solid var(--rule-paper)",
          }}
        >
          {/* Name column */}
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(24px,2.4vw,40px)",
              fontWeight: 300,
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                letterSpacing: "0.16em",
                color: "var(--muted-paper)",
                marginRight: "16px",
              }}
            >
              {row.number}
            </span>
            {row.name}
          </h3>

          {/* Description column */}
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              lineHeight: 1.55,
              maxWidth: "52ch",
            }}
          >
            {row.description}
          </p>
        </div>
      ))}
    </div>
  );
}
