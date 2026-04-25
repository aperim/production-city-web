/**
 * Services page.
 * Route: /services and /:locale/services
 */

import { ErrorBoundary } from "../error-boundary";
import { ServicesPage } from "../pages/services";

export default function Page() {
  return (
    <ErrorBoundary>
      <ServicesPage />
    </ErrorBoundary>
  );
}
