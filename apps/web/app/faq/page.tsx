/**
 * FAQ landing page.
 * Route: /faq and /:locale/faq
 */

import { ErrorBoundary } from "../error-boundary";
import { FAQPage } from "../pages/faq";

export default function Page() {
  return (
    <ErrorBoundary>
      <FAQPage />
    </ErrorBoundary>
  );
}
