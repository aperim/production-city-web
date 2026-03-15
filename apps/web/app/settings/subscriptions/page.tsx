/**
 * Subscription preferences page (authenticated).
 * Route: /settings/subscriptions
 */

import { ErrorBoundary } from "../../error-boundary";
import { AuthProvider } from "../../lib/auth-context";
import { SubscriptionPreferencesPage } from "../../pages/subscription-preferences";

export default function Page() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionPreferencesPage />
      </AuthProvider>
    </ErrorBoundary>
  );
}
