"use client";

import { type HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type {
  Category,
  SubscriptionChannel,
  SubscriptionStatus,
} from "../../types/announcements";
import { ChannelIcon } from "../../atoms/ChannelIcon/ChannelIcon";
import { SubscriptionStatusDot } from "../../atoms/SubscriptionStatusDot/SubscriptionStatusDot";

/** Props for the SubscriptionToggle molecule. */
export interface SubscriptionToggleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Category info. */
  category: Category;
  /** Current email subscription status (null = not subscribed). */
  emailStatus: SubscriptionStatus | null;
  /** Current SMS subscription status (null = not subscribed). */
  smsStatus: SubscriptionStatus | null;
  /** Whether the user has a phone number (disables SMS toggle if false). */
  hasPhone: boolean;
  /** Subscribe handler — called with the channel. */
  onSubscribe: (channel: SubscriptionChannel) => void;
  /** Unsubscribe handler — called with subscription ID. */
  onUnsubscribe: (subscriptionId: string) => void;
  /** Resend confirmation handler — called with subscription ID. */
  onResend: (subscriptionId: string) => void;
  /** Loading state. */
  loading?: boolean;
  /** Email subscription ID (needed for unsubscribe/resend). */
  emailSubscriptionId?: string;
  /** SMS subscription ID (needed for unsubscribe/resend). */
  smsSubscriptionId?: string;
  /** Error message to display. */
  error?: string;
}

/**
 * Toggle control for subscribing/unsubscribing from a category with channel selection.
 *
 * Shows separate toggles for email and SMS channels with status indicators.
 * SMS toggle is disabled when hasPhone is false.
 * Shows a resend button for pending subscriptions.
 */
function SubscriptionToggle({
  category,
  emailStatus,
  smsStatus,
  hasPhone,
  onSubscribe,
  onUnsubscribe,
  onResend,
  loading = false,
  emailSubscriptionId,
  smsSubscriptionId,
  error,
  className,
  ...props
}: SubscriptionToggleProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        loading && "opacity-60 pointer-events-none",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">
            {category.name}
          </h4>
          {category.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <ChannelRow
          channel="email"
          status={emailStatus}
          subscriptionId={emailSubscriptionId}
          disabled={loading}
          onSubscribe={() => onSubscribe("email")}
          onUnsubscribe={() =>
            emailSubscriptionId && onUnsubscribe(emailSubscriptionId)
          }
          onResend={() =>
            emailSubscriptionId && onResend(emailSubscriptionId)
          }
        />

        <ChannelRow
          channel="sms"
          status={smsStatus}
          subscriptionId={smsSubscriptionId}
          disabled={loading || !hasPhone}
          disabledReason={!hasPhone ? "Add a phone number to enable SMS" : undefined}
          onSubscribe={() => onSubscribe("sms")}
          onUnsubscribe={() =>
            smsSubscriptionId && onUnsubscribe(smsSubscriptionId)
          }
          onResend={() =>
            smsSubscriptionId && onResend(smsSubscriptionId)
          }
        />
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface ChannelRowProps {
  channel: SubscriptionChannel;
  status: SubscriptionStatus | null;
  subscriptionId?: string;
  disabled: boolean;
  disabledReason?: string;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
  onResend: () => void;
}

function ChannelRow({
  channel,
  status,
  subscriptionId,
  disabled,
  disabledReason,
  onSubscribe,
  onUnsubscribe,
  onResend,
}: ChannelRowProps) {
  const isSubscribed = status !== null;
  const isPending = status === "pending";
  const hasId = Boolean(subscriptionId);

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="flex items-center gap-2">
        <ChannelIcon channel={channel} size="sm" />
        <span className="text-xs text-muted-foreground capitalize">
          {channel}
        </span>
        {status && <SubscriptionStatusDot status={status} />}
      </div>

      <div className="flex items-center gap-1">
        {isPending && hasId && (
          <button
            type="button"
            onClick={onResend}
            disabled={disabled}
            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend
          </button>
        )}

        {isSubscribed && hasId ? (
          <button
            type="button"
            onClick={onUnsubscribe}
            disabled={disabled}
            className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Unsubscribe
          </button>
        ) : !isSubscribed ? (
          <button
            type="button"
            onClick={onSubscribe}
            disabled={disabled}
            title={disabledReason}
            className="rounded-md border border-primary/50 bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Subscribe
          </button>
        ) : null}
      </div>
    </div>
  );
}

export { SubscriptionToggle };
