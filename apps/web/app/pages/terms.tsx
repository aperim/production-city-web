"use client";

import { I18nProvider, useTranslation } from "../i18n/context";
import { tArray } from "../i18n/index";
import type { SupportedLocale } from "../i18n/index.js";
import { LandingPageTemplate } from "@productioncity/holding-ui";
import { useLandingNav, useLandingFooter } from "../lib/use-landing-layout";
import { SimpleWebPageStructuredData } from "../lib/structured-data";

interface TermsPageProps {
  serverLocale?: SupportedLocale;
}

export function TermsPage({ serverLocale }: TermsPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <TermsPageContent />
    </I18nProvider>
  );
}

function TermsPageContent() {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const usageItems = tArray("legal.terms.usage.items", locale);
  const userAccountItems = tArray("legal.terms.userAccounts.items", locale);
  const submissionItems = tArray("legal.terms.submissions.items", locale);
  const disclaimerItems = tArray("legal.terms.disclaimer.items", locale);
  const consumerLawItems = tArray("legal.terms.consumerLaw.items", locale);
  const liabilityItems = tArray("legal.terms.liability.items", locale);
  const indemnityItems = tArray("legal.terms.indemnity.items", locale);
  const disputeSteps = tArray("legal.terms.disputeResolution.steps", locale);

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <SimpleWebPageStructuredData
        name="Terms of Use — Production City"
        description="Terms of use for Production City (operated by Aperim Pty Ltd): the conditions governing your use of our website and services."
        path="/terms"
      />
      <div className="mx-auto max-w-3xl py-12">
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
          {t("legal.terms.effectiveDate", { date: "27 April 2026" })}
        </p>

        {/* Section 1 — About these terms */}
        <section className="mt-10" aria-labelledby="terms-about">
          <h2 id="terms-about" className="text-xl font-semibold text-foreground">
            {t("legal.terms.about.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.about.description")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.about.agreement")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.about.updates")}
          </p>
        </section>

        {/* Section 2 — Use of the Website */}
        <section className="mt-10" aria-labelledby="terms-usage">
          <h2 id="terms-usage" className="text-xl font-semibold text-foreground">
            {t("legal.terms.usage.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.usage.description")}
          </p>
          {usageItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {usageItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.terms.usage.reserve")}
          </p>
        </section>

        {/* Section 3 — Intellectual property */}
        <section className="mt-10" aria-labelledby="terms-ip">
          <h2 id="terms-ip" className="text-xl font-semibold text-foreground">
            {t("legal.terms.ip.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.ip.description")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.ip.restriction")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.ip.licence")}
          </p>
        </section>

        {/* Section 4 — User accounts */}
        <section className="mt-10" aria-labelledby="terms-user-accounts">
          <h2 id="terms-user-accounts" className="text-xl font-semibold text-foreground">
            {t("legal.terms.userAccounts.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.about.description")}
          </p>
          {userAccountItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {userAccountItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.terms.userAccounts.magicLinks")}
          </p>
        </section>

        {/* Section 5 — Expressions of interest and submissions */}
        <section className="mt-10" aria-labelledby="terms-submissions">
          <h2 id="terms-submissions" className="text-xl font-semibold text-foreground">
            {t("legal.terms.submissions.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.intro")}
          </p>
          {submissionItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {submissionItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Section 6 — Disclaimer */}
        <section className="mt-10" aria-labelledby="terms-disclaimer">
          <h2 id="terms-disclaimer" className="text-xl font-semibold text-foreground">
            {t("legal.terms.disclaimer.title")}
          </h2>
          <p className="mt-2 font-medium text-sm text-muted-foreground">
            {t("legal.terms.disclaimer.prelaunch")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.disclaimer.description")}
          </p>
          {disclaimerItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {disclaimerItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Section 7 — Forward-looking statements */}
        <section className="mt-10" aria-labelledby="terms-forward-looking">
          <h2 id="terms-forward-looking" className="text-xl font-semibold text-foreground">
            {t("legal.terms.forwardLooking.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.forwardLooking.description")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.forwardLooking.note")}
          </p>
        </section>

        {/* Section 8 — Australian Consumer Law */}
        <section className="mt-10" aria-labelledby="terms-consumer-law">
          <h2 id="terms-consumer-law" className="text-xl font-semibold text-foreground">
            {t("legal.terms.consumerLaw.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.consumerLaw.description")}
          </p>
          {consumerLawItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {consumerLawItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </section>

        {/* Section 9 — Limitation of liability */}
        <section className="mt-10" aria-labelledby="terms-liability">
          <h2 id="terms-liability" className="text-xl font-semibold text-foreground">
            {t("legal.terms.liability.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.liability.description")}
          </p>
          {liabilityItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {liabilityItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.terms.liability.note")}
          </p>
        </section>

        {/* Section 10 — Indemnity */}
        <section className="mt-10" aria-labelledby="terms-indemnity">
          <h2 id="terms-indemnity" className="text-xl font-semibold text-foreground">
            {t("legal.terms.indemnity.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.indemnity.description")}
          </p>
          {indemnityItems.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
              {indemnityItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.terms.indemnity.note")}
          </p>
        </section>

        {/* Section 11 — Third-party links */}
        <section className="mt-10" aria-labelledby="terms-third-party-links">
          <h2 id="terms-third-party-links" className="text-xl font-semibold text-foreground">
            {t("legal.terms.thirdPartyLinks.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.thirdPartyLinks.description")}
          </p>
        </section>

        {/* Section 12 — Dispute resolution */}
        <section className="mt-10" aria-labelledby="terms-dispute">
          <h2 id="terms-dispute" className="text-xl font-semibold text-foreground">
            {t("legal.terms.disputeResolution.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.disputeResolution.description")}
          </p>
          {disputeSteps.length > 0 && (
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-muted-foreground">
              {disputeSteps.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {t("legal.terms.disputeResolution.note")}
          </p>
        </section>

        {/* Section 13 — Governing law */}
        <section className="mt-10" aria-labelledby="terms-jurisdiction">
          <h2 id="terms-jurisdiction" className="text-xl font-semibold text-foreground">
            {t("legal.terms.jurisdiction.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.jurisdiction.description")}
          </p>
        </section>

        {/* Section 14 — Severability */}
        <section className="mt-10" aria-labelledby="terms-severability">
          <h2 id="terms-severability" className="text-xl font-semibold text-foreground">
            {t("legal.terms.severability.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.severability.description")}
          </p>
        </section>

        {/* Section 15 — Waiver */}
        <section className="mt-10" aria-labelledby="terms-waiver">
          <h2 id="terms-waiver" className="text-xl font-semibold text-foreground">
            {t("legal.terms.waiver.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.waiver.description")}
          </p>
        </section>

        {/* Section 16 — Assignment */}
        <section className="mt-10" aria-labelledby="terms-assignment">
          <h2 id="terms-assignment" className="text-xl font-semibold text-foreground">
            {t("legal.terms.assignment.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.assignment.description")}
          </p>
        </section>

        {/* Section 17 — Entire agreement */}
        <section className="mt-10" aria-labelledby="terms-entire-agreement">
          <h2 id="terms-entire-agreement" className="text-xl font-semibold text-foreground">
            {t("legal.terms.entireAgreement.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("legal.terms.entireAgreement.description")}
          </p>
        </section>

        {/* Section 18 — Contact */}
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
