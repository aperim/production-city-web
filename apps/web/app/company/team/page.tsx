/**
 * Company team page.
 * Route: /company/team and /:locale/company/team
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../../error-boundary";
import { CompanyTeamPage } from "../../pages/company-team";

export const metadata: Metadata = {
  title: "Leadership Team — Production City™",
  description:
    "Meet the leadership team behind Production City™: Troy Kelly (CEO) and Matthew Compton (Executive Director, First Nations).",
  openGraph: {
    title: "Leadership Team — Production City™",
    description:
      "Meet the leadership team behind Production City™: Troy Kelly (CEO) and Matthew Compton (Executive Director, First Nations).",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <CompanyTeamPage />
    </ErrorBoundary>
  );
}
