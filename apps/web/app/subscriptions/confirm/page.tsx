/**
 * Subscription confirmation page.
 * Route: /subscriptions/confirm?token=...
 */

import { ErrorBoundary } from "../../error-boundary";
import { SubscriptionConfirmPage } from "../../pages/subscription-confirm";

export default function Page() {
  return (
    <ErrorBoundary>
      <SubscriptionConfirmPage />
    </ErrorBoundary>
  );
}
