/**
 * Subscription confirmation page.
 * Route: /subscriptions/confirm?token=...
 */

import { ErrorBoundary } from "../../error-boundary";
import { SubscriptionConfirmPage } from "../../pages/subscription-confirm";
import { getServerLocale } from "../../i18n/get-server-locale.js";

export default async function Page() {
  const serverLocale = await getServerLocale();

  return (
    <ErrorBoundary>
      <SubscriptionConfirmPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
