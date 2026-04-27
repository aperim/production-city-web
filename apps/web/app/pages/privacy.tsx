"use client";

import { I18nProvider, useTranslation } from "../i18n/context";
import type { SupportedLocale } from "../i18n/index.js";
import { tArray } from "../i18n/index";
import { LandingPageTemplate } from "@productioncity/holding-ui";
import { useLandingNav, useLandingFooter } from "../lib/use-landing-layout";
import { SimpleWebPageStructuredData, DublinCoreMeta } from "../lib/structured-data";


interface PrivacyPageProps {
  serverLocale?: SupportedLocale;
}

export function PrivacyPage({ serverLocale }: PrivacyPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <PrivacyPageContent />
    </I18nProvider>
  );
}

const THIRD_PARTY_PROVIDERS = [
  {
    name: "Cloudflare, Inc.",
    country: "United States",
    data: "IP address, request metadata, website content",
    purpose: "Website hosting, CDN, DDoS protection, edge compute (Workers), database (D1), web analytics",
  },
  {
    name: "ActiveCampaign LLC (Postmark)",
    country: "United States",
    data: "Email address, name, email content, delivery metadata",
    purpose: "Transactional and marketing email delivery, bounce and spam complaint tracking",
  },
  {
    name: "Twilio Inc.",
    country: "United States",
    data: "Phone number, SMS content, delivery status",
    purpose: "SMS notification delivery, STOP/START compliance",
  },
  {
    name: "Google LLC (Google Fonts)",
    country: "United States",
    data: "IP address, browser user-agent",
    purpose: "Delivery of web font files (Noto Sans) for Arabic, Devanagari, and Bengali script support via fonts.gstatic.com. Google does not set cookies through this service.",
  },
] as const;

const RETENTION_PERIODS = [
  { data: "Expressions of interest", period: "24 months from last point of contact" },
  { data: "User accounts", period: "Retained while active; deactivated accounts are soft-deleted and retained for legal and audit purposes" },
  { data: "Session data", period: "Automatically cleaned up after 30 days of inactivity; hard expiry at 90 days" },
  { data: "Magic links", period: "Automatically cleaned up after expiry (15 minutes for login, 7 days for invitations)" },
  { data: "Audit logs", period: "7 years from creation, for security and regulatory compliance" },
  { data: "Email/SMS suppression records", period: "Retained until manually removed by an administrator" },
] as const;

const COOKIES_TABLE = [
  {
    name: "__Secure-session",
    purpose: "Authentication session management",
    duration: "Up to 90 days (30-day idle timeout)",
    setBy: "Server (HttpOnly, Secure, SameSite=Lax)",
  },
  {
    name: "pc-locale-suggestion",
    purpose: "Stores a locale suggestion based on your browser language for first-time visitors",
    duration: "7 days",
    setBy: "Server (Secure, SameSite=Lax)",
  },
] as const;

function PrivacyPageContent() {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const dataCollectionItems = tArray("legal.privacy.dataCollection.items", locale);
  const howWeCollectItems = tArray("legal.privacy.howWeCollect.items", locale);
  const purposeItems = tArray("legal.privacy.purpose.items", locale);
  const marketingItems = tArray("legal.privacy.marketing.items", locale);
  const crossBorderCountries = tArray("legal.privacy.crossBorder.countries", locale);
  const securityItems = tArray("legal.privacy.security.items", locale);
  const rightsItems = tArray("legal.privacy.rights.items", locale);
  const ndbItems = tArray("legal.privacy.ndb.items", locale);
  const complaintsSteps = tArray("legal.privacy.complaints.steps", locale);

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <SimpleWebPageStructuredData
        name="Privacy Policy — Production City"
        description="Privacy policy for Production City (operated by Aperim Pty Ltd): how we collect, use, and protect your personal information."
        path="/privacy"
      />
      <DublinCoreMeta
        title="Privacy Policy — Production City"
        description="Privacy policy for Production City: how we collect, use, and protect your personal information."
        subject="privacy policy, data protection, personal information, legal"
        path="/privacy"
        date="2026-04-27"
      />
      <div className="mx-auto max-w-3xl py-12">
        <a
          href={`${prefix}/`}
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
        >
          ← {t("legal.backToHome")}
        </a>

        <h1 id="page-heading" className="mt-4 text-3xl font-bold text-foreground">
          {t("legal.privacy.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("legal.privacy.effectiveDate", { date: "27 April 2026" })}
        </p>

        {/* Section 1 — About this policy */}
        <section className="mt-10" aria-labelledby="privacy-about">
          <h2 id="privacy-about" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.about.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.about.description")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.about.obligations")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.about.contact")}
          </p>
        </section>

        {/* Section 2 — Personal information we collect */}
        <section className="mt-10" aria-labelledby="privacy-data-collection">
          <h2 id="privacy-data-collection" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.dataCollection.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.dataCollection.description")}
          </p>
          {dataCollectionItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {dataCollectionItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.dataCollection.sensitive")}
          </p>
        </section>

        {/* Section 3 — How we collect */}
        <section className="mt-10" aria-labelledby="privacy-how-collect">
          <h2 id="privacy-how-collect" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.howWeCollect.title")}
          </h2>
          {howWeCollectItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {howWeCollectItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.howWeCollect.note")}
          </p>
        </section>

        {/* Section 4 — Purpose */}
        <section className="mt-10" aria-labelledby="privacy-purpose">
          <h2 id="privacy-purpose" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.purpose.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.purpose.description")}
          </p>
          {purposeItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {purposeItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.purpose.note")}
          </p>
        </section>

        {/* Section 5 — Direct marketing */}
        <section className="mt-10" aria-labelledby="privacy-marketing">
          <h2 id="privacy-marketing" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.marketing.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.marketing.description")}
          </p>
          {marketingItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {marketingItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.marketing.spam")}
          </p>
        </section>

        {/* Section 6 — Disclosure to third parties */}
        <section className="mt-10" aria-labelledby="privacy-third-parties">
          <h2 id="privacy-third-parties" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.thirdParties.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.thirdParties.description")}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Service provider</th>
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Country</th>
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">What they process</th>
                  <th className="pb-2 text-left font-medium text-foreground">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {THIRD_PARTY_PROVIDERS.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.name}</td>
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.country}</td>
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.data}</td>
                    <td className="py-2 align-top text-muted-foreground">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.thirdParties.note")}
          </p>
        </section>

        {/* Section 7 — Cross-border disclosure */}
        <section className="mt-10" aria-labelledby="privacy-cross-border">
          <h2 id="privacy-cross-border" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.crossBorder.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.crossBorder.description")}
          </p>
          {crossBorderCountries.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {crossBorderCountries.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.crossBorder.note")}
          </p>
        </section>

        {/* Section 8 — Data quality and security */}
        <section className="mt-10" aria-labelledby="privacy-security">
          <h2 id="privacy-security" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.security.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.security.description")}
          </p>
          {securityItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {securityItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.security.note")}
          </p>
        </section>

        {/* Section 9 — Data retention */}
        <section className="mt-10" aria-labelledby="privacy-retention">
          <h2 id="privacy-retention" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.retention.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.retention.description")}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Data type</th>
                  <th className="pb-2 text-left font-medium text-foreground">Retention period</th>
                </tr>
              </thead>
              <tbody>
                {RETENTION_PERIODS.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.data}</td>
                    <td className="py-2 align-top text-muted-foreground">{row.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 10 — Cookies and tracking technologies */}
        <section className="mt-10" aria-labelledby="privacy-cookies">
          <h2 id="privacy-cookies" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.cookiesSection.title")}
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Cookie name</th>
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Purpose</th>
                  <th className="pb-2 pr-4 text-left font-medium text-foreground">Duration</th>
                  <th className="pb-2 text-left font-medium text-foreground">Set by</th>
                </tr>
              </thead>
              <tbody>
                {COOKIES_TABLE.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-4 align-top font-mono text-xs text-muted-foreground">{row.name}</td>
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.purpose}</td>
                    <td className="py-2 pr-4 align-top text-muted-foreground">{row.duration}</td>
                    <td className="py-2 align-top text-muted-foreground">{row.setBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.cookiesSection.description")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.cookiesSection.analytics")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.cookiesSection.link")}{" "}
            <a href={`${prefix}/cookies`} className="underline underline-offset-4 hover:text-foreground">
              {t("legal.cookiePolicy")}
            </a>
          </p>
        </section>

        {/* Section 11 — Children's privacy */}
        <section className="mt-10" aria-labelledby="privacy-children">
          <h2 id="privacy-children" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.children.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.children.description")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.children.contact")}
          </p>
        </section>

        {/* Section 12 — Anonymity and pseudonymity */}
        <section className="mt-10" aria-labelledby="privacy-anonymity">
          <h2 id="privacy-anonymity" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.anonymity.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.anonymity.description")}
          </p>
        </section>

        {/* Section 13 — Accessing and correcting */}
        <section className="mt-10" aria-labelledby="privacy-rights">
          <h2 id="privacy-rights" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.rights.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.rights.description")}
          </p>
          {rightsItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {rightsItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.rights.contact")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.rights.note")}
          </p>
        </section>

        {/* Section 14 — Notifiable data breaches */}
        <section className="mt-10" aria-labelledby="privacy-ndb">
          <h2 id="privacy-ndb" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.ndb.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.ndb.description")}
          </p>
          {ndbItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {ndbItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Section 15 — Complaints */}
        <section className="mt-10" aria-labelledby="privacy-complaints">
          <h2 id="privacy-complaints" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.complaints.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.complaints.description")}
          </p>
          {complaintsSteps.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {complaintsSteps.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.complaints.oaic.description")}
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Website: <a href="https://www.oaic.gov.au" className="underline underline-offset-4 hover:text-foreground" rel="noopener noreferrer" target="_blank">{t("legal.privacy.complaints.oaic.website")}</a></li>
            <li>Phone: {t("legal.privacy.complaints.oaic.phone")}</li>
            <li>Email: {t("legal.privacy.complaints.oaic.email")}</li>
            <li>Post: {t("legal.privacy.complaints.oaic.post")}</li>
          </ul>
        </section>

        {/* Section 16 — Changes */}
        <section className="mt-10" aria-labelledby="privacy-changes">
          <h2 id="privacy-changes" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.changes.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.changes.description")}
          </p>
        </section>

        {/* Section 17 — Contact */}
        <section className="mt-10 border-t border-border pt-8" aria-labelledby="privacy-contact">
          <h2 id="privacy-contact" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.contact.title")}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
            {t("legal.privacy.contact.description")}
          </p>
        </section>
      </div>
    </LandingPageTemplate>
  );
}
