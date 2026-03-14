import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const connectionDotVariants = cva(
  "inline-block shrink-0 rounded-full",
  {
    variants: {
      state: {
        connected: "bg-emerald-500",
        reconnecting: "bg-amber-500 animate-pulse",
        disconnected: "bg-red-500",
      },
      size: {
        sm: "h-1.5 w-1.5",
        md: "h-2 w-2",
        lg: "h-3 w-3",
      },
    },
    defaultVariants: {
      state: "connected",
      size: "md",
    },
  },
);

/** Props for the ConnectionDot atom */
interface ConnectionDotProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof connectionDotVariants> {}

const STATE_LABELS: Record<string, string> = {
  connected: "Connected",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
};

/**
 * ConnectionDot atom -- colored dot indicating WebSocket connection state.
 *
 * States: connected (green), reconnecting (amber, pulsing), disconnected (red).
 */
function ConnectionDot({ className, state, size, ...props }: ConnectionDotProps) {
  const label = STATE_LABELS[state ?? "connected"] ?? "Unknown";
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(connectionDotVariants({ state, size, className }))}
      {...props}
    />
  );
}

export { ConnectionDot, connectionDotVariants };
export type { ConnectionDotProps };
