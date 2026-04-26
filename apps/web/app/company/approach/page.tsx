/**
 * Company approach page.
 * Route: /company/approach and /:locale/company/approach
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../../error-boundary";
import { CompanyApproachPage } from "../../pages/company-approach";

export const metadata: Metadata = {
  title: "Our Approach — Production City™",
  description:
    "How Production City™ integrates screen and stage under one roof: the production platform, partnership model, and long-term operating thesis.",
  openGraph: {
    title: "Our Approach — Production City™",
    description:
      "How Production City™ integrates screen and stage under one roof: the production platform, partnership model, and long-term operating thesis.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <CompanyApproachPage />
    </ErrorBoundary>
  );
}
