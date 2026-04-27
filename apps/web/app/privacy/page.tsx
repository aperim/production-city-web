/**
 * Privacy Policy page.
 * Route: /privacy and /:locale/privacy
 */

import type { Metadata } from "vinext/shims/metadata";
import { ErrorBoundary } from "../error-boundary";
import { PrivacyPage } from "../pages/privacy";
import { getServerLocale } from "../i18n/get-server-locale.js";

export const metadata: Metadata = {
  title: "Privacy Policy — Production City™",
  description: "Production City™ privacy policy: how we collect, use, and protect personal information.",
  openGraph: {
    title: "Privacy Policy — Production City™",
    description: "Production City™ privacy policy: how we collect, use, and protect personal information.",
    type: "website",
    siteName: "Production City™",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@productioncity",
    title: "Privacy Policy — Production City™",
    description: "Production City™ privacy policy: how we collect, use, and protect personal information.",
    images: [{ url: "https://production.city/media/home-hero/light.jpg", alt: "Production City™ — A vertically integrated screen and stage campus" }],
  },
};

export default async function Page() {
  const serverLocale = await getServerLocale();
  return (
    <ErrorBoundary>
      <PrivacyPage serverLocale={serverLocale} />
    </ErrorBoundary>
  );
}
