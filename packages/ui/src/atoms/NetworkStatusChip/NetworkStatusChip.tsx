import { cn } from "../../lib/utils";

/** Status for a network campus location */
export type NetworkStatus = "lead" | "active" | "assess" | "follow";

/** Props for the NetworkStatusChip atom */
export interface NetworkStatusChipProps {
  /** Display text (e.g., "Sydney · Leading candidate"). */
  label: string;
  /** Campus status variant. */
  status: NetworkStatus;
  /** Additional CSS classes. */
  className?: string;
}

const statusStyles: Record<NetworkStatus, { border: string; color: string; dot: string }> = {
  lead: {
    border: "var(--accent)",
    color: "var(--accent)",
    dot: "var(--accent)",
  },
  active: {
    border: "rgba(247,245,240,0.35)",
    color: "var(--paper)",
    dot: "rgba(247,245,240,0.6)",
  },
  assess: {
    border: "rgba(247,245,240,0.2)",
    color: "rgba(247,245,240,0.5)",
    dot: "rgba(247,245,240,0.3)",
  },
  follow: {
    border: "rgba(247,245,240,0.12)",
    color: "rgba(247,245,240,0.35)",
    dot: "rgba(247,245,240,0.2)",
  },
};

const statusLabel: Record<NetworkStatus, string> = {
  lead: "Lead campus",
  active: "In sequence",
  assess: "Under assessment",
  follow: "Follows",
};

/**
 * NetworkStatusChip atom — pill badge for campus location status in the network section.
 *
 * Maps to reference `.net-chip` pattern.
 * Used on the network page hero to show current campus sequence status.
 */
export function NetworkStatusChip({
  label,
  status,
  className,
}: NetworkStatusChipProps) {
  const styles = statusStyles[status];

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      style={{
        border: `1px solid ${styles.border}`,
        color: styles.color,
        padding: "6px 14px",
        fontFamily: "var(--mono)",
        fontSize: "11px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
      }}
      title={statusLabel[status]}
    >
      {/* Status dot */}
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: styles.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
