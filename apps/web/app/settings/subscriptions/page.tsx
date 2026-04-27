/**
 * Subscription preferences page (authenticated).
 * Route: /settings/subscriptions
 */

import { ErrorBoundary } from "../../error-boundary";
import { AuthProvider } from "../../lib/auth-context";
import { SubscriptionPreferencesPage } from "../../pages/subscription-preferences";
import { getServerLocale } from "../../i18n/get-server-locale.js";

export default async function Page() {
  const serverLocale = await getServerLocale();
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionPreferencesPage serverLocale={serverLocale} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
