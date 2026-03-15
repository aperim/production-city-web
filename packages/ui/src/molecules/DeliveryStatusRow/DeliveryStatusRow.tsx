import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type { DeliveryStatus, SubscriptionChannel } from "../../types/announcements";
import { ChannelIcon } from "../../atoms/ChannelIcon/ChannelIcon";

/** Props for the DeliveryStatusRow molecule. */
export interface DeliveryStatusRowProps
  extends HTMLAttributes<HTMLTableRowElement> {
  /** Recipient name. */
  userName: string;
  /** Delivery channel. */
  channel: SubscriptionChannel;
  /** Current delivery status. */
  status: DeliveryStatus;
  /** ISO date when sent. */
  sentAt: string | null;
  /** ISO date when delivered. */
  deliveredAt: string | null;
  /** ISO date when opened (email only). */
  openedAt: string | null;
  /** Error message (when status is failed). */
  error?: string;
  /** Whether to show as a loading skeleton. */
  loading?: boolean;
}

const statusStyles: Record<DeliveryStatus, string> = {
  queued: "text-neutral-400",
  sending: "text-sky-400",
  sent: "text-sky-400",
  delivered: "text-emerald-400",
  failed: "text-red-400",
  suppressed: "text-amber-400",
};

const statusLabels: Record<DeliveryStatus, string> = {
  queued: "Queued",
  sending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  failed: "Failed",
  suppressed: "Suppressed",
};

/**
 * Single row showing delivery status for an announcement recipient.
 *
 * Designed to be used inside a <tbody> element. Shows name, channel,
 * status, and timestamps.
 */
function DeliveryStatusRow({
  userName,
  channel,
  status,
  sentAt,
  deliveredAt,
  openedAt,
  error,
  loading = false,
  className,
  ...props
}: DeliveryStatusRowProps) {
  if (loading) {
    return (
      <tr className={cn("animate-pulse", className)} aria-busy="true" {...props}>
        <td className="px-3 py-2"><div className="h-4 w-24 rounded bg-muted" /></td>
        <td className="px-3 py-2"><div className="h-4 w-12 rounded bg-muted" /></td>
        <td className="px-3 py-2"><div className="h-4 w-16 rounded bg-muted" /></td>
        <td className="px-3 py-2"><div className="h-4 w-20 rounded bg-muted" /></td>
        <td className="px-3 py-2"><div className="h-4 w-20 rounded bg-muted" /></td>
        <td className="px-3 py-2"><div className="h-4 w-20 rounded bg-muted" /></td>
      </tr>
    );
  }

  return (
    <tr
      className={cn(
        "border-b border-border text-sm text-foreground",
        className,
      )}
      {...props}
    >
      <td className="px-3 py-2 font-medium">{userName}</td>
      <td className="px-3 py-2">
        <ChannelIcon channel={channel} size="sm" />
      </td>
      <td className="px-3 py-2">
        <span className={cn("text-xs font-medium", statusStyles[status])}>
          {statusLabels[status]}
        </span>
        {status === "failed" && error && (
          <span className="block text-xs text-red-400/70 mt-0.5">
            {error}
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {sentAt ? formatTime(sentAt) : "—"}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {deliveredAt ? formatTime(deliveredAt) : "—"}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {openedAt ? formatTime(openedAt) : "—"}
      </td>
    </tr>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-AU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export { DeliveryStatusRow };
