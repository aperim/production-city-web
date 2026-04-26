/**
 * Campus Masterplan landing page — interactive 3D campus viewer with narrative arc.
 * Route: /masterplan and /:locale/masterplan
 */

import { ErrorBoundary } from "../error-boundary";
import { MasterplanPage } from "../pages/masterplan";

export default function Page() {
  return (
    <ErrorBoundary>
      <MasterplanPage />
    </ErrorBoundary>
  );
}
