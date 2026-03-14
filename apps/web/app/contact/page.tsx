/**
 * Contact & EOI landing page.
 * Route: /contact and /:locale/contact
 */

import { ErrorBoundary } from "../error-boundary";
import { ContactPage } from "../pages/contact";

export default function Page() {
  return (
    <ErrorBoundary>
      <ContactPage />
    </ErrorBoundary>
  );
}
