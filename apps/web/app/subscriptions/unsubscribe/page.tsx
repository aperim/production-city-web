/**
 * Unsubscribe page — two-step flow.
 * Route: /subscriptions/unsubscribe?token=...
 */

import { ErrorBoundary } from "../../error-boundary";
import { SubscriptionUnsubscribePage } from "../../pages/subscription-unsubscribe";

export default function Page() {
  return (
    <ErrorBoundary>
      <SubscriptionUnsubscribePage />
    </ErrorBoundary>
  );
}
