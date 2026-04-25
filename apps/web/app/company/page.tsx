/**
 * Company overview page.
 * Route: /company and /:locale/company
 */

import { ErrorBoundary } from "../error-boundary";
import { CompanyPage } from "../pages/company";

export default function Page() {
  return (
    <ErrorBoundary>
      <CompanyPage />
    </ErrorBoundary>
  );
}
