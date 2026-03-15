"use client";

import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import type {
  Category,
  Subscription,
  SubscriptionChannel,
} from "../../types/announcements";
import { SubscriptionToggle } from "../../molecules/SubscriptionToggle/SubscriptionToggle";

/** Props for the SubscriptionManager organism. */
export interface SubscriptionManagerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** All available categories. */
  categories: Category[];
  /** User's subscriptions. */
  subscriptions: Subscription[];
  /** Whether the user has a phone number. */
  hasPhone: boolean;
  /** Subscribe handler. */
  onSubscribe: (categoryId: string, channel: SubscriptionChannel) => void;
  /** Unsubscribe handler. */
  onUnsubscribe: (subscriptionId: string) => void;
  /** Resend confirmation handler. */
  onResend: (subscriptionId: string) => void;
  /** Loading state. */
  loading?: boolean;
}

/**
 * Full subscription management panel showing all categories with toggle controls.
 */
function SubscriptionManager({
  categories,
  subscriptions,
  hasPhone,
  onSubscribe,
  onUnsubscribe,
  onResend,
  loading = false,
  className,
  ...props
}: SubscriptionManagerProps) {
  if (categories.length === 0) {
    return (
      <div className={cn("w-full", className)} {...props}>
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No categories available for subscription.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {!hasPhone && (
        <div className="mb-4 rounded-lg border border-amber-800/50 bg-amber-900/20 p-3">
          <p className="text-xs text-amber-400">
            Add a phone number to your profile to enable SMS subscriptions.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {categories.map((category) => {
          const catSubs = subscriptions.filter(
            (s) => s.categoryId === category.id,
          );
          const emailSub = catSubs.find((s) => s.channel === "email");
          const smsSub = catSubs.find((s) => s.channel === "sms");

          return (
            <SubscriptionToggle
              key={category.id}
              category={category}
              emailStatus={emailSub?.status ?? null}
              smsStatus={smsSub?.status ?? null}
              hasPhone={hasPhone}
              emailSubscriptionId={emailSub?.id}
              smsSubscriptionId={smsSub?.id}
              onSubscribe={(channel) => onSubscribe(category.id, channel)}
              onUnsubscribe={onUnsubscribe}
              onResend={onResend}
              loading={loading}
            />
          );
        })}
      </div>
    </div>
  );
}

export { SubscriptionManager };
