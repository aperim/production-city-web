/**
 * Subscription decline page.
 * Route: /subscriptions/decline?token=...
 */

import { ErrorBoundary } from "../../error-boundary";
import { SubscriptionDeclinePage } from "../../pages/subscription-decline";

export default function Page() {
  return (
    <ErrorBoundary>
      <SubscriptionDeclinePage />
    </ErrorBoundary>
  );
}
