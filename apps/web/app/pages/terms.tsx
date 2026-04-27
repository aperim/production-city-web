/**
 * Terms of Use page — Aperim Pty Ltd Terms of Use.
 * Legal content awaiting formal legal review before go-live.
 * All text from i18n (legal.terms.* keys).
 */

"use client";

import { I18nProvider, useTranslation } from "../i18n/context";
import {
  LandingPageTemplate,
} from "@productioncity/holding-ui";
import {
  useLandingNav,
  useLandingFooter,
} from "../lib/use-landing-layout";
import { SimpleWebPageStructuredData } from "../lib/structured-data";

export function TermsPage() {
  return (
    <I18nProvider>
      <TermsPageContent />
    </I18nProvider>
  );
}

function TermsPageContent() {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <SimpleWebPageStructuredData
        name="Terms of Use — Production City"
        description="Terms of use for Production City (operated by Aperim Pty Ltd): the conditions governing your use of our website and services."
        path="/terms"
      />
      <div className="mx-auto max-w-3xl py-12">
        {/* Back link */}
        <a
          href={`${prefix}/`}
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
        >
          ← {t("legal.backToHome")}
        </a>

        <h1 id="page-heading" className="mt-4 text-3xl font-bold text-foreground">
          {t("legal.terms.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("legal.terms.effectiveDate", { date: "1 April 2026" })}
        </p>

        <p className="mt-6 text-base text-foreground">
          {t("legal.terms.intro")}
        </p>

        {/* Use of Website */}
        <section className="mt-10" aria-labelledby="terms-usage">
          <h2 id="terms-usage" className="text-xl font-semibold text-foreground">
            {t("legal.terms.usage.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.usage.description")}
          </p>
        </section>

        {/* Intellectual Property */}
        <section className="mt-10" aria-labelledby="terms-ip">
          <h2 id="terms-ip" className="text-xl font-semibold text-foreground">
            {t("legal.terms.ip.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.ip.description")}
          </p>
        </section>

        {/* Disclaimer */}
        <section className="mt-10" aria-labelledby="terms-disclaimer">
          <h2 id="terms-disclaimer" className="text-xl font-semibold text-foreground">
            {t("legal.terms.disclaimer.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.disclaimer.description")}
          </p>
        </section>

        {/* Forward-Looking Statements */}
        <section className="mt-10" aria-labelledby="terms-forward-looking">
          <h2 id="terms-forward-looking" className="text-xl font-semibold text-foreground">
            {t("legal.terms.forwardLooking.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.forwardLooking.description")}
          </p>
        </section>

        {/* Limitation of Liability */}
        <section className="mt-10" aria-labelledby="terms-liability">
          <h2 id="terms-liability" className="text-xl font-semibold text-foreground">
            {t("legal.terms.liability.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.liability.description")}
          </p>
        </section>

        {/* Governing Law */}
        <section className="mt-10" aria-labelledby="terms-jurisdiction">
          <h2 id="terms-jurisdiction" className="text-xl font-semibold text-foreground">
            {t("legal.terms.jurisdiction.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.jurisdiction.description")}
          </p>
        </section>

        {/* Changes to These Terms */}
        <section className="mt-10" aria-labelledby="terms-changes">
          <h2 id="terms-changes" className="text-xl font-semibold text-foreground">
            {t("legal.terms.changes.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.changes.description")}
          </p>
        </section>

        {/* Contact */}
        <section className="mt-10 border-t border-border pt-8" aria-labelledby="terms-contact">
          <h2 id="terms-contact" className="text-xl font-semibold text-foreground">
            {t("legal.terms.contact.title")}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
            {t("legal.terms.contact.description")}
          </p>
        </section>
      </div>
    </LandingPageTemplate>
  );
}
