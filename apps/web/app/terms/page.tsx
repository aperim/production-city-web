/**
 * Terms of Use page.
 * Route: /terms and /:locale/terms
 */

import { ErrorBoundary } from "../error-boundary";
import { TermsPage } from "../pages/terms";

export default function Page() {
  return (
    <ErrorBoundary>
      <TermsPage />
    </ErrorBoundary>
  );
}
