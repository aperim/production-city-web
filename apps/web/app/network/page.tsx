/**
 * Network page — global campus sequence.
 * Route: /network and /:locale/network
 */

import { ErrorBoundary } from "../error-boundary";
import { NetworkPage } from "../pages/network";

export default function Page() {
  return (
    <ErrorBoundary>
      <NetworkPage />
    </ErrorBoundary>
  );
}
