/**
 * Company team page.
 * Route: /company/team and /:locale/company/team
 */

import { ErrorBoundary } from "../../error-boundary";
import { CompanyTeamPage } from "../../pages/company-team";

export default function Page() {
  return (
    <ErrorBoundary>
      <CompanyTeamPage />
    </ErrorBoundary>
  );
}
