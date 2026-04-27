/**
 * Subscription preferences page (authenticated).
 * Route: /settings/subscriptions
 *
 * Allows users to manage their announcement subscriptions
 * with optimistic updates, resend confirmation, and bulk subscribe.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  SubscriptionManager,
  type Category,
  type Subscription,
  type SubscriptionChannel,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import type { SupportedLocale } from "../i18n/index.js";
import { useLandingNav, useLandingFooter } from "../lib/use-landing-layout";
import { LandingPageTemplate } from "@productioncity/holding-ui";
import { useAuth } from "../lib/auth-context";
import { ProtectedRoute } from "../lib/route-guard";
import { DublinCoreMeta } from "../lib/structured-data";
import {
  listCategories,
  listMySubscriptions,
  createSubscription,
  deleteSubscription,
  resendSubscriptionConfirmation,
  type SubscriptionItem,
} from "../lib/api-client";

/** Map API subscription item to UI Subscription type. */
function toSubscription(s: SubscriptionItem): Subscription {
  return {
    id: s.id,
    categoryId: s.category.id,
    channel: s.channel as SubscriptionChannel,
    status: s.status as Subscription["status"],
  };
}

function SubscriptionPreferencesContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      listCategories(),
      listMySubscriptions(),
    ]).then(([catResult, subResult]) => {
      if (catResult.ok) {
        setCategories(catResult.data.categories);
      }
      if (subResult.ok) {
        setSubscriptions(subResult.data.subscriptions.map(toSubscription));
      }
      setLoading(false);
    });
  }, []);

  // Subscribe handler with optimistic update
  const handleSubscribe = useCallback(async (categoryId: string, channel: SubscriptionChannel) => {
    // Optimistic: add pending subscription
    const optimisticId = `opt-${Date.now()}`;
    const optimistic: Subscription = {
      id: optimisticId,
      categoryId,
      channel,
      status: "pending",
    };
    setSubscriptions((prev) => [...prev, optimistic]);

    try {
      const result = await createSubscription(categoryId, [channel]);
      if (result.ok) {
        // Replace optimistic with real subscription
        setSubscriptions((prev) =>
          prev
            .filter((s) => s.id !== optimisticId)
            .concat(result.data.subscriptions.map(toSubscription)),
        );
      } else {
        // Rollback
        setSubscriptions((prev) => prev.filter((s) => s.id !== optimisticId));
      }
    } catch {
      // Rollback
      setSubscriptions((prev) => prev.filter((s) => s.id !== optimisticId));
    }
  }, []);

  // Unsubscribe handler with optimistic update
  const handleUnsubscribe = useCallback(async (subscriptionId: string) => {
    // Optimistic: remove subscription
    const removed = subscriptions.find((s) => s.id === subscriptionId);
    setSubscriptions((prev) => prev.filter((s) => s.id !== subscriptionId));

    try {
      const result = await deleteSubscription(subscriptionId);
      if (!result.ok && removed) {
        // Rollback
        setSubscriptions((prev) => [...prev, removed]);
      }
    } catch {
      if (removed) {
        setSubscriptions((prev) => [...prev, removed]);
      }
    }
  }, [subscriptions]);

  // Resend handler
  const handleResend = useCallback(async (subscriptionId: string) => {
    await resendSubscriptionConfirmation(subscriptionId);
  }, []);

  // Bulk subscribe all categories
  const handleSubscribeAll = useCallback(async () => {
    setLoading(true);
    const unsubscribedCategories = categories.filter(
      (cat) => !subscriptions.some((s) => s.categoryId === cat.id && s.channel === "email"),
    );

    for (const cat of unsubscribedCategories) {
      await createSubscription(cat.id, ["email"]);
    }

    // Refresh subscriptions
    const result = await listMySubscriptions();
    if (result.ok) {
      setSubscriptions(result.data.subscriptions.map(toSubscription));
    }
    setLoading(false);
  }, [categories, subscriptions]);

  const hasPhone = user?.hasPhone ?? false;

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <DublinCoreMeta
        title="Subscription Preferences — Production City"
        description="Manage your Production City subscription preferences."
        type="InteractiveResource"
        path="/settings/subscriptions"
        date="2026-04-27"
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <header className="mb-8">
          <h1 id="subscription-preferences-heading" className="text-2xl font-bold text-foreground">
            {t("subscriptions.preferences.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("subscriptions.preferences.description")}
          </p>
        </header>

        {/* Bulk subscribe */}
        {categories.length > 0 && (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={handleSubscribeAll}
              disabled={loading}
              className="rounded-md border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("subscriptions.preferences.subscribe_all")}
            </button>
          </div>
        )}

        {/* Subscription manager */}
        <SubscriptionManager
          categories={categories}
          subscriptions={subscriptions}
          hasPhone={hasPhone}
          onSubscribe={handleSubscribe}
          onUnsubscribe={handleUnsubscribe}
          onResend={handleResend}
          loading={loading}
        />

        {/* Weekly digest teaser */}
        <div className="mt-6 rounded-lg border border-border bg-card/50 p-4 opacity-60">
          <p className="text-xs text-muted-foreground">
            {t("subscriptions.preferences.digest_coming_soon")}
          </p>
        </div>
      </div>
    </LandingPageTemplate>
  );
}


interface SubscriptionPreferencesPageProps {
  serverLocale?: SupportedLocale;
}

export function SubscriptionPreferencesPage({ serverLocale }: SubscriptionPreferencesPageProps) {
  return (
    <ProtectedRoute loginPath="/login?redirect=/settings/subscriptions">
      <I18nProvider serverLocale={serverLocale}>
        <SubscriptionPreferencesContent />
      </I18nProvider>
    </ProtectedRoute>
  );
}
