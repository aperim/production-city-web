/**
 * Privacy Policy page — Aperim Pty Ltd Privacy Policy.
 * Legal content awaiting formal legal review before go-live.
 * All text from i18n (legal.privacy.* keys).
 */

"use client";

import { I18nProvider, useTranslation } from "../i18n/context";
import { tArray } from "../i18n/index";
import {
  LandingPageTemplate,
} from "@productioncity/holding-ui";
import {
  useLandingNav,
  useLandingFooter,
} from "../lib/use-landing-layout";

export function PrivacyPage() {
  return (
    <I18nProvider>
      <PrivacyPageContent />
    </I18nProvider>
  );
}

function PrivacyPageContent() {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const dataCollectionItems = tArray("legal.privacy.dataCollection.items", locale);
  const purposeItems = tArray("legal.privacy.purpose.items", locale);
  const thirdPartyItems = tArray("legal.privacy.thirdParties.items", locale);
  const rightsItems = tArray("legal.privacy.rights.items", locale);

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <div className="mx-auto max-w-3xl py-12">
        {/* Back link */}
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
          {t("legal.privacy.effectiveDate", { date: "1 April 2025" })}
        </p>

        <p className="mt-6 text-base text-foreground">
          {t("legal.privacy.intro")}
        </p>

        {/* Information We Collect */}
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
        </section>

        {/* How We Use Your Information */}
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
        </section>

        {/* Lawful Basis */}
        <section className="mt-10" aria-labelledby="privacy-lawful-basis">
          <h2 id="privacy-lawful-basis" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.lawfulBasis.title")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>{t("legal.privacy.lawfulBasis.consent")}</li>
            <li>{t("legal.privacy.lawfulBasis.legitimateInterest")}</li>
            <li>{t("legal.privacy.lawfulBasis.marketing")}</li>
          </ul>
        </section>

        {/* Data Retention */}
        <section className="mt-10" aria-labelledby="privacy-retention">
          <h2 id="privacy-retention" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.retention.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.retention.description")}
          </p>
        </section>

        {/* Third-Party Services */}
        <section className="mt-10" aria-labelledby="privacy-third-parties">
          <h2 id="privacy-third-parties" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.thirdParties.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.thirdParties.description")}
          </p>
          {thirdPartyItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {thirdPartyItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.privacy.thirdParties.note")}
          </p>
        </section>

        {/* Your Rights */}
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
        </section>

        {/* Governing Law */}
        <section className="mt-10" aria-labelledby="privacy-jurisdiction">
          <h2 id="privacy-jurisdiction" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.jurisdiction.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.jurisdiction.description")}
          </p>
        </section>

        {/* Changes to This Policy */}
        <section className="mt-10" aria-labelledby="privacy-changes">
          <h2 id="privacy-changes" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.changes.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.changes.description")}
          </p>
        </section>

        {/* Contact Us */}
        <section className="mt-10 border-t border-border pt-8" aria-labelledby="privacy-contact">
          <h2 id="privacy-contact" className="text-xl font-semibold text-foreground">
            {t("legal.privacy.contact.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.privacy.contact.description")}
          </p>
        </section>
      </div>
    </LandingPageTemplate>
  );
}
