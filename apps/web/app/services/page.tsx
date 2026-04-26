/**
 * Services page.
 * Route: /services and /:locale/services
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { ServicesPage } from "../pages/services";

export const metadata: Metadata = {
  title: "Services — Production City™",
  description:
    "Integrated production services for screen and stage: pre-production, principal photography, post-production, and distribution.",
  openGraph: {
    title: "Services — Production City™",
    description:
      "Integrated production services for screen and stage: pre-production, principal photography, post-production, and distribution.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <ServicesPage />
    </ErrorBoundary>
  );
}
