/**
 * XSS-safe Schema.org/JSON-LD structured data helpers.
 * Uses DOM textContent assignment (never innerHTML) to safely embed JSON-LD scripts.
 *
 * All page-level schema components in this file are "use client" safe.
 */

"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "../i18n/context";

const SITE_URL = "https://production.city";

// ─── Core primitive ────────────────────────────────────────────────────────────

interface JsonLdProps {
  schema: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders a <script type="application/ld+json"> tag using the XSS-safe
 * textContent pattern. Never uses dangerouslySetInnerHTML or JSX injection.
 */
export function JsonLd({ schema }: JsonLdProps) {
  const scriptRef = useRef<HTMLScriptElement>(null);

  useEffect(() => {
    if (!scriptRef.current) return;
    scriptRef.current.textContent = JSON.stringify(schema);
  }, [schema]);

  return <script ref={scriptRef} type="application/ld+json" />;
}

// ─── Schema builders ───────────────────────────────────────────────────────────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Production City",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.svg`,
    },
    description:
      "Production City is a purpose-built integrated screen and stage campus in Australia — combining sound stages, broadcast theatre, studio offices, and shared infrastructure under one operator.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "AU",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "troy@team.production.city",
        telephone: "+61-2-9137-9100",
        areaServed: "AU",
        availableLanguage: "English",
      },
    ],
    sameAs: [
      "https://www.linkedin.com/company/productioncity",
    ],
  };
}

export function webSiteSchema(locale: string) {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Production City",
    url: SITE_URL,
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}${prefix}/faq?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function webPageSchema(opts: {
  type?: string;
  name: string;
  description?: string;
  url: string;
  locale?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    "@id": `${opts.url}#webpage`,
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    url: opts.url,
    ...(opts.locale ? { inLanguage: opts.locale } : {}),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    ...(opts.breadcrumbs ? { breadcrumb: breadcrumbSchema(opts.breadcrumbs) } : {}),
  };
}

// ─── Reusable page schema components ──────────────────────────────────────────

/** Home page: WebSite + Organization + WebPage */
export function HomeStructuredData() {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}/`;

  return (
    <>
      <JsonLd schema={organizationSchema()} />
      <JsonLd schema={webSiteSchema(locale)} />
      <JsonLd
        schema={webPageSchema({
          name: "Production City — Integrated Screen & Stage Campus",
          description:
            "Purpose-built integrated screen and stage campus in Australia, combining sound stages, broadcast theatre, studio offices, and shared infrastructure.",
          url,
          locale,
        })}
      />
    </>
  );
}

/** Generic WebPage structured data for simple pages */
export function SimpleWebPageStructuredData({
  name,
  description,
  path,
  pageType,
  breadcrumbs,
}: {
  name: string;
  description?: string;
  path: string;
  pageType?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}) {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}${path}`;

  return (
    <JsonLd
      schema={webPageSchema({
        type: pageType,
        name,
        description,
        url,
        locale,
        breadcrumbs,
      })}
    />
  );
}

/** Contact page: ContactPage + Organization with contact points */
export function ContactStructuredData() {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}/contact`;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "@id": `${url}#webpage`,
        name: "Contact Production City",
        description:
          "Get in touch with Production City — enquiries for producers, investors, creatives, partners, education, employment, and general information.",
        url,
        inLanguage: locale,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: {
          "@type": "Organization",
          name: "Production City",
          url: SITE_URL,
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              email: "troy@team.production.city",
              telephone: "+61-2-9137-9100",
              availableLanguage: "English",
            },
            {
              "@type": "ContactPoint",
              contactType: "customer support",
              telephone: "+1-650-215-6253",
              areaServed: "US",
              availableLanguage: "English",
            },
          ],
        },
      }}
    />
  );
}

/** Facilities index: WebPage + ItemList */
export function FacilitiesStructuredData() {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}/facilities`;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        name: "Facilities — Production City",
        description:
          "Production City facilities: commercial sound stages, screen sound stages, broadcast theatre, and broadcast control room — all on one integrated campus.",
        url,
        inLanguage: locale,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          name: "Production City Facilities",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Commercial Sound Stages",
              url: `${SITE_URL}${prefix}/facilities/commercial-sound-stages`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Screen Sound Stages",
              url: `${SITE_URL}${prefix}/facilities/screen-sound-stages`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Broadcast Theatre",
              url: `${SITE_URL}${prefix}/facilities/broadcast-theatre`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: "Broadcast Control Room",
              url: `${SITE_URL}${prefix}/facilities/broadcast-control-room`,
            },
          ],
        },
      }}
    />
  );
}

/** Individual facility page: LocalBusiness + BreadcrumbList */
export function FacilityStructuredData({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}/facilities/${slug}`;

  return (
    <JsonLd
      schema={[
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": `${url}#facility`,
          name,
          description,
          url,
          address: {
            "@type": "PostalAddress",
            addressCountry: "AU",
          },
          parentOrganization: { "@id": `${SITE_URL}/#organization` },
        },
        breadcrumbSchema([
          { name: "Home", url: `${SITE_URL}${prefix}/` },
          { name: "Facilities", url: `${SITE_URL}${prefix}/facilities` },
          { name, url },
        ]),
      ]}
    />
  );
}

/** Services page: WebPage + ItemList of services */
export function ServicesStructuredData() {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}/services`;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        name: "Services — Production City",
        description:
          "Production City services: production, post-production, broadcast, live event, and studio services for screen and stage productions.",
        url,
        inLanguage: locale,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      }}
    />
  );
}

/** Company overview: AboutPage + Organization */
export function CompanyStructuredData() {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}/company`;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${url}#webpage`,
        name: "Company — Production City",
        description:
          "About Production City: our operating model, strategy, and the team building Australia's integrated screen and stage campus.",
        url,
        inLanguage: locale,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${SITE_URL}/#organization` },
      }}
    />
  );
}

/** Company team page: AboutPage + Person entries */
export function CompanyTeamStructuredData() {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}/company/team`;

  return (
    <JsonLd
      schema={[
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${url}#webpage`,
          name: "Team — Production City",
          description: "Meet the team behind Production City.",
          url,
          inLanguage: locale,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          publisher: { "@id": `${SITE_URL}/#organization` },
        },
        {
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": `${SITE_URL}/#troy-kelly`,
          name: "Troy Kelly",
          jobTitle: "Founder & Chief Executive",
          worksFor: { "@id": `${SITE_URL}/#organization` },
          email: "troy@team.production.city",
          url: `${SITE_URL}${prefix}/company/team`,
        },
        breadcrumbSchema([
          { name: "Home", url: `${SITE_URL}${prefix}/` },
          { name: "Company", url: `${SITE_URL}${prefix}/company` },
          { name: "Team", url },
        ]),
      ]}
    />
  );
}

/** Company approach page: AboutPage + BreadcrumbList */
export function CompanyApproachStructuredData() {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}/company/approach`;

  return (
    <JsonLd
      schema={[
        webPageSchema({
          type: "AboutPage",
          name: "Approach — Production City",
          description:
            "Production City's integrated operating model: shared infrastructure, purpose-built facilities, and a collaborative approach to screen and stage production.",
          url,
          locale,
        }),
        breadcrumbSchema([
          { name: "Home", url: `${SITE_URL}${prefix}/` },
          { name: "Company", url: `${SITE_URL}${prefix}/company` },
          { name: "Approach", url },
        ]),
      ]}
    />
  );
}

// ─── Dublin Core metadata ─────────────────────────────────────────────────────

export interface DublinCoreMetaProps {
  /** Page title for DC.title */
  title: string;
  /** Page description for DC.description */
  description?: string;
  /** Topic keywords for DC.subject (comma-separated) */
  subject?: string;
  /**
   * DCMI type vocabulary term — http://purl.org/dc/terms/type
   * @default "Text"
   */
  type?: "Text" | "Collection" | "InteractiveResource" | "Image" | "Service";
  /** URL path used to build DC.identifier (e.g. "/facilities") */
  path: string;
  /** ISO 8601 last-modified date for DC.date */
  date?: string;
  /** Content creator; defaults to "Production City" */
  creator?: string;
}

/**
 * Injects per-page Dublin Core <meta> tags into document.head via DOM.
 *
 * Site-wide static DC tags (publisher, rights, format, language) are emitted
 * server-side by layout.tsx — they are NOT repeated here to avoid duplication.
 */
export function DublinCoreMeta({
  title,
  description,
  subject,
  type = "Text",
  path,
  date,
  creator = "Production City",
}: DublinCoreMetaProps) {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const identifier = `${SITE_URL}${prefix}${path}`;

  useEffect(() => {
    const entries: [string, string][] = [["DC.title", title], ["DC.creator", creator]];
    if (subject) entries.push(["DC.subject", subject]);
    if (description) entries.push(["DC.description", description]);
    if (date) entries.push(["DC.date", date]);
    entries.push(["DC.type", type], ["DC.identifier", identifier]);

    const elements = entries.map(([name, content]) => {
      const meta = document.createElement("meta");
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
      return meta;
    });

    return () => {
      for (const el of elements) el.remove();
    };
  }, [title, creator, subject, description, date, type, identifier]);

  return null;
}

// ─── Announcements ─────────────────────────────────────────────────────────────

/** Announcements list: fix to safe pattern */
export function AnnouncementsStructuredData() {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}/announcements`;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        name: "Updates — Production City",
        description: "Latest news and updates from Production City",
        url,
        inLanguage: locale,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      }}
    />
  );
}

/** Announcement detail: Article — uses textContent pattern via JsonLd */
export function AnnouncementDetailStructuredData({
  title,
  summary,
  authorName,
  publishedAt,
  lastEditedAt,
  slug,
}: {
  title: string;
  summary: string | undefined;
  authorName: string;
  publishedAt: string;
  lastEditedAt?: string | null;
  slug: string;
}) {
  const { locale } = useTranslation();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${prefix}/announcements/${slug}`;

  return (
    <JsonLd
      schema={{
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${url}#article`,
        headline: title,
        ...(summary ? { description: summary } : {}),
        author: {
          "@type": "Person",
          name: authorName,
        },
        datePublished: publishedAt,
        dateModified: lastEditedAt ?? publishedAt,
        url,
        inLanguage: locale,
        publisher: { "@id": `${SITE_URL}/#organization` },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      }}
    />
  );
}
