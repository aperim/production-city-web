/**
 * Cookie Policy page.
 * Route: /cookies and /:locale/cookies
 */

import { ErrorBoundary } from "../error-boundary";
import { CookiesPage } from "../pages/cookies";

export default function Page() {
  return (
    <ErrorBoundary>
      <CookiesPage />
    </ErrorBoundary>
  );
}
