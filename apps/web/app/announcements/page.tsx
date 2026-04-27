/**
 * Announcements route handler.
 * Route: /announcements — listing
 * Route: /announcements/:slug — detail (client-side slug detection)
 *
 * vinext serves this page for /announcements and sub-paths.
 * The client component parses the URL to determine listing vs detail view.
 */

import type { Metadata } from "vinext/shims/metadata";
import { headers } from "vinext/shims/headers";
import { validateXLocale } from "../i18n/x-locale-validation.js";
import { t, loadLocale } from "../i18n/index.js";
import AnnouncementsClient from "./AnnouncementsClient";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = validateXLocale(headersList.get("X-Locale"));
  await loadLocale(locale);
  const title = t("announcements.meta.title", undefined, locale);
  const description = t("announcements.meta.description", undefined, locale);
  return { title, description, openGraph: { title, description } };
}

export default function Page() {
  return <AnnouncementsClient />;
}
