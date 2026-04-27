/**
 * Unsubscribe page — two-step flow.
 * Route: /subscriptions/unsubscribe?token=...
 */

import { ErrorBoundary } from "../../error-boundary";
import { SubscriptionUnsubscribePage } from "../../pages/subscription-unsubscribe";
import { getServerLocale } from "../../i18n/get-server-locale.js";

export default async function Page() {
  const serverLocale = await getServerLocale();

  return (
    <ErrorBoundary>
      <SubscriptionUnsubscribePage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
