/**
 * Facilities landing page — deep-dive into planned production facilities.
 * Route: /facilities and /:locale/facilities
 */

import { ErrorBoundary } from "../error-boundary";
import { FacilitiesPage } from "../pages/facilities";

export default function Page() {
  return (
    <ErrorBoundary>
      <FacilitiesPage />
    </ErrorBoundary>
  );
}
