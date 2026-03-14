/**
 * Creative & Ecosystem landing page — the integrated creative ecosystem.
 * Route: /creative and /:locale/creative
 */

import { ErrorBoundary } from "../error-boundary";
import { CreativePage } from "../pages/creative";

export default function Page() {
  return (
    <ErrorBoundary>
      <CreativePage />
    </ErrorBoundary>
  );
}
