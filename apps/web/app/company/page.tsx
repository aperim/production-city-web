/**
 * Company overview page.
 * Route: /company and /:locale/company
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { CompanyPage } from "../pages/company";

export const metadata: Metadata = {
  title: "Company — Production City™",
  description:
    "Production City™ company overview: vision, leadership, vertical integration model, and the five pillars of our production precinct.",
  openGraph: {
    title: "Company — Production City™",
    description:
      "Production City™ company overview: vision, leadership, vertical integration model, and the five pillars of our production precinct.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <CompanyPage />
    </ErrorBoundary>
  );
}
