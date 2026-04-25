/**
 * Company approach page.
 * Route: /company/approach
 */

"use client";

import {
  LandingPageTemplate,
  ScrollRevealSection,
  ForwardLookingDisclaimer,
  EOISection,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";

export function CompanyApproachPage() {
  return (
    <I18nProvider>
      <CompanyApproachPageContent />
    </I18nProvider>
  );
}

function CompanyApproachPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* Hero */}
      <section className="py-16 border-b border-border" aria-labelledby="page-heading">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
          {t("companyApproach.eyebrow")}
        </p>
        <h1 id="page-heading" className="text-3xl font-semibold text-foreground sm:text-4xl">
          {t("companyApproach.heading")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {t("companyApproach.lead")}
        </p>
      </section>

      {/* Vertical integration argument */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border">
          <div className="mb-8">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              {t("companyApproach.vertLabel")}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {t("companyApproach.vertHeading")}
            </h2>
          </div>
          <div className="max-w-3xl flex flex-col gap-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{t("companyApproach.vert1")}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("companyApproach.vert2")}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("companyApproach.vert3")}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("companyApproach.vert4")}</p>
          </div>
        </section>
      </ScrollRevealSection>

      {/* Operator platform */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border">
          <div className="mb-8">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              {t("companyApproach.platformLabel")}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {t("companyApproach.platformHeading")}
            </h2>
          </div>
          <p
            className="max-w-2xl text-lg text-foreground leading-relaxed"
            style={{ fontFamily: "var(--font-serif, serif)" }}
          >
            {t("companyApproach.platformDesc")}
          </p>
        </section>
      </ScrollRevealSection>

      {/* CTA */}
      <section className="py-12 border-b border-border text-center">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          {t("companyApproach.cta")}
        </h2>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t("companyApproach.ctaLink")} →
        </a>
      </section>

      {/* EOI */}
      <div id="eoi-section" className="border-t border-border">
        <EOISection
          heading={t("facilities.eoi.heading")}
          contextText={t("facilities.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory="producer"
          onSubmit={handleEoiSubmit}
        />
      </div>

      <ForwardLookingDisclaimer text={t("facilities.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
