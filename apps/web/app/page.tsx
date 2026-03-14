/**
 * Home landing page — the primary entry point for Production City.
 * Route: / and /:locale/
 */

import { ErrorBoundary } from "./error-boundary";
import { HomePage } from "./pages/home";

export default function Page() {
  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  );
}
