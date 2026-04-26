/**
 * Facilities landing page — deep-dive into planned production facilities.
 * Route: /facilities and /:locale/facilities
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { FacilitiesPage } from "../pages/facilities";

export const metadata: Metadata = {
  title: "Facilities — Production City™",
  description:
    "World-class screen and stage production facilities: LED volumes, broadcast theatres, commercial and screen sound stages.",
  openGraph: {
    title: "Facilities — Production City™",
    description:
      "World-class screen and stage production facilities: LED volumes, broadcast theatres, commercial and screen sound stages.",
  },
};

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilitiesPage />
    </ErrorBoundary>
  );
}
