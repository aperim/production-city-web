/**
 * Subscription decline page.
 * Route: /subscriptions/decline?token=...
 */

import { ErrorBoundary } from "../../error-boundary";
import { SubscriptionDeclinePage } from "../../pages/subscription-decline";
import { getServerLocale } from "../../i18n/get-server-locale.js";

export default async function Page() {
  const serverLocale = await getServerLocale();

  return (
    <ErrorBoundary>
      <SubscriptionDeclinePage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
