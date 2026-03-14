/**
 * Vision & Global Network landing page — global vision and stakeholder value.
 * Route: /vision and /:locale/vision
 */

import { ErrorBoundary } from "../error-boundary";
import { VisionPage } from "../pages/vision";

export default function Page() {
  return (
    <ErrorBoundary>
      <VisionPage />
    </ErrorBoundary>
  );
}
