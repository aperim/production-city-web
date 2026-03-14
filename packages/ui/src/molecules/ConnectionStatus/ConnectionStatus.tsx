import type { HTMLAttributes } from "react";
import { ConnectionDot } from "../../atoms/ConnectionDot/ConnectionDot";
import { Tooltip } from "../../atoms/Tooltip/Tooltip";
import { cn } from "../../lib/utils";

/** Connection state type */
type ConnectionState = "connected" | "reconnecting" | "disconnected";

/** Props for the ConnectionStatus molecule */
interface ConnectionStatusProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Current connection state */
  state: ConnectionState;
  /** Label text to show next to the dot */
  label?: string;
  /** Tooltip text shown on hover */
  tooltip?: string;
  /** Compact mode shows only dot, label in tooltip */
  compact?: boolean;
}

const DEFAULT_LABELS: Record<ConnectionState, string> = {
  connected: "Connected",
  reconnecting: "Reconnecting...",
  disconnected: "Disconnected",
};

const DEFAULT_TOOLTIPS: Record<ConnectionState, string> = {
  connected: "Real-time updates active",
  reconnecting: "Attempting to restore connection",
  disconnected: "Real-time updates unavailable. You may experience delays.",
};

/**
 * ConnectionStatus molecule -- dot + label + tooltip for connection state.
 *
 * Shows a colored dot with optional label. Hover reveals detailed tooltip.
 * In compact mode, only the dot is shown with the label in the tooltip.
 */
function ConnectionStatus({
  state,
  label,
  tooltip,
  compact = false,
  className,
  ...props
}: ConnectionStatusProps) {
  const displayLabel = label ?? DEFAULT_LABELS[state];
  const displayTooltip = tooltip ?? DEFAULT_TOOLTIPS[state];
  const showLabel = !compact && state !== "connected";

  return (
    <Tooltip content={compact ? displayLabel : displayTooltip} position="bottom">
      <div
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      >
        <ConnectionDot state={state} />
        {showLabel && (
          <span className="text-xs text-muted-foreground">{displayLabel}</span>
        )}
      </div>
    </Tooltip>
  );
}

export { ConnectionStatus };
export type { ConnectionStatusProps, ConnectionState };
