/**
 * Privacy Policy page.
 * Route: /privacy and /:locale/privacy
 */

import { ErrorBoundary } from "../error-boundary";
import { PrivacyPage } from "../pages/privacy";

export default function Page() {
  return (
    <ErrorBoundary>
      <PrivacyPage />
    </ErrorBoundary>
  );
}
