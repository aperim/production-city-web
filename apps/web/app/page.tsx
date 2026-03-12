import { HoldingPage } from "@productioncity/holding-ui";
import { ErrorBoundary } from "./error-boundary";

/**
 * Root page — renders the HoldingPage template from packages/ui,
 * wrapped in an error boundary for resilience.
 */
export default function Page() {
  return (
    <ErrorBoundary>
      <HoldingPage />
    </ErrorBoundary>
  );
}
