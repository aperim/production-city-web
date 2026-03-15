import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { SubscriptionChannel } from "../../types/announcements";

/** Props for the ChannelIcon atom. */
export interface ChannelIconProps extends HTMLAttributes<HTMLSpanElement> {
  /** The subscription channel to display. */
  channel: SubscriptionChannel;
  /** Icon size. */
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

/**
 * Inline SVG icon representing a subscription channel (email or SMS).
 */
function ChannelIcon({
  channel,
  size = "md",
  className,
  ...props
}: ChannelIconProps) {
  const sizeClass = sizeMap[size];

  return (
    <span
      className={cn("inline-flex items-center justify-center", className)}
      aria-label={channel === "email" ? "Email" : "SMS"}
      role="img"
      {...props}
    >
      {channel === "email" ? (
        <svg
          className={sizeClass}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
          <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
        </svg>
      ) : (
        <svg
          className={sizeClass}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h11A2.5 2.5 0 0 1 18 4.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 2 15.5v-11ZM5.75 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Zm0 3a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Zm0 3a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-4.5Z" />
        </svg>
      )}
    </span>
  );
}

export { ChannelIcon };
