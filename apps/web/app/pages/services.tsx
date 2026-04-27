/**
 * Services page.
 * Route: /services
 */

"use client";

import {
  LandingPageTemplate,
  MediaHero,
  EOISection,
  ScrollRevealSection,
  ForwardLookingDisclaimer,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import type { SupportedLocale } from "../i18n/index.js";
import { MEDIA } from "../lib/media-config";
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";
import { ServicesStructuredData } from "../lib/structured-data";


interface ServicesPageProps {
  serverLocale?: SupportedLocale;
}

export function ServicesPage({ serverLocale }: ServicesPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <ServicesPageContent />
    </I18nProvider>
  );
}

const SERVICE_KEYS = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09",
  "10", "11", "12", "13", "14", "15", "16", "17",
] as const;

function ServicesPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <ServicesStructuredData />
      {/* Hero */}
      {MEDIA["services-hero"] && (
        <MediaHero
          lightSrc={MEDIA["services-hero"].lightSrc}
          darkSrc={MEDIA["services-hero"].darkSrc}
          alt={MEDIA["services-hero"].alt}
          width={MEDIA["services-hero"].width}
          height={500}
          averageColor={MEDIA["services-hero"].averageColor}
          photographer={MEDIA["services-hero"].photographer}
          photographerUrl={MEDIA["services-hero"].photographerUrl}
          source={MEDIA["services-hero"].source}
          sourceUrl={MEDIA["services-hero"].sourceUrl}
        >
          <div className="pb-8">
            <p className="text-xs font-mono tracking-widest text-white/60 uppercase mb-4">
              {t("services.eyebrow")}
            </p>
            <h1 id="page-heading" className="text-3xl font-semibold text-white sm:text-4xl">
              {t("services.heading")}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/80">
              {t("services.lead")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* Service list */}
      <ScrollRevealSection delay={0}>
        <section className="py-10 border-b border-border" aria-labelledby="page-heading">
          <div className="flex flex-col divide-y divide-border">
            {SERVICE_KEYS.map((num) => (
              <div key={num} className="flex gap-6 py-5 items-baseline">
                <span className="text-xs font-mono tracking-widest text-muted-foreground w-8 shrink-0">
                  {num}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t(`services.item${num}Name` as Parameters<typeof t>[0])}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`services.item${num}Desc` as Parameters<typeof t>[0])}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollRevealSection>

      {/* Operational argument */}
      <ScrollRevealSection delay={100}>
        <section className="py-10 border-b border-border bg-foreground/5" aria-labelledby="operational-heading">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-2">
              <h2 id="operational-heading" className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                {t("services.operationalLabel")}
              </h2>
            </div>
            <p className="lg:col-span-9 text-lg text-foreground leading-relaxed" style={{ fontFamily: "var(--font-serif, serif)" }}>
              {t("services.operationalPoint")}
            </p>
          </div>
        </section>
      </ScrollRevealSection>

      {/* CTA */}
      <section className="py-12 border-b border-border text-center" aria-labelledby="services-cta-heading">
        <h2 id="services-cta-heading" className="text-xl font-semibold text-foreground mb-6">
          {t("services.cta")}
        </h2>
        <a
          href="/facilities"
          className="inline-flex items-center gap-2 border border-border px-6 py-3 text-sm text-foreground hover:bg-muted transition-colors"
        >
          {t("services.ctaLink")} →
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
