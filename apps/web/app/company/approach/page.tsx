/**
 * Company approach page.
 * Route: /company/approach and /:locale/company/approach
 */

import { ErrorBoundary } from "../../error-boundary";
import { CompanyApproachPage } from "../../pages/company-approach";

export default function Page() {
  return (
    <ErrorBoundary>
      <CompanyApproachPage />
    </ErrorBoundary>
  );
}
