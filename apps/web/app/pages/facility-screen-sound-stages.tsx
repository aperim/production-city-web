/**
 * Screen Sound Stages detail page.
 * Route: /facilities/screen-sound-stages
 */

"use client";

import {
  LandingPageTemplate,
  EOISection,
  ScrollRevealSection,
  ForwardLookingDisclaimer,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";

export function FacilityScreenSoundStagesPage() {
  return (
    <I18nProvider>
      <FacilityScreenSoundStagesContent />
    </I18nProvider>
  );
}

function FacilityScreenSoundStagesContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const specs = [
    { k: t("facilities.screenStages.detail.specDimensions"), v: t("facilities.screenStages.detail.specDimensionsValue") },
    { k: t("facilities.screenStages.detail.specArea"), v: t("facilities.screenStages.detail.specAreaValue") },
    { k: t("facilities.screenStages.detail.specHeight"), v: t("facilities.screenStages.detail.specHeightValue") },
    { k: t("facilities.screenStages.detail.specSoundproofing"), v: t("facilities.screenStages.detail.specSoundproofingValue") },
    { k: t("facilities.screenStages.detail.specLed"), v: t("facilities.screenStages.detail.specLedValue") },
    { k: t("facilities.screenStages.detail.specGrid"), v: t("facilities.screenStages.detail.specGridValue") },
  ];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* Hero */}
      <section className="py-16 border-b border-border" aria-labelledby="page-heading">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
          {t("facilities.screenStages.detail.eyebrow")}
        </p>
        <h1 id="page-heading" className="text-3xl font-semibold text-foreground sm:text-4xl">
          {t("facilities.screenStages.detail.heading")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {t("facilities.screenStages.detail.lead")}
        </p>
      </section>

      {/* Main content */}
      <ScrollRevealSection delay={0}>
        <section className="py-10 border-b border-border" aria-labelledby="detail-heading">
          <h2 id="detail-heading" className="sr-only">{t("facilities.common.detail.sectionHeading")}</h2>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
            {/* Prose */}
            <div className="flex flex-col gap-4">
              <p className="text-base text-foreground leading-relaxed">
                {t("facilities.screenStages.detail.prose")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("facilities.screenStages.detail.prose2")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("facilities.screenStages.detail.prose3")}
              </p>

              <div className="mt-4">
                <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">
                  {t("facilities.screenStages.detail.usageLabel")}
                </p>
                <ul className="flex flex-col gap-2">
                  {(["usage1", "usage2", "usage3"] as const).map((key) => (
                    <li key={key} className="text-sm text-foreground">
                      — {t(`facilities.screenStages.detail.${key}` as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Spec table */}
            <div>
              <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
                {t("facilities.screenStages.detail.specLabel")}
              </p>
              <dl className="flex flex-col divide-y divide-border">
                {specs.map(({ k, v }) => (
                  <div key={k} className="flex justify-between py-3 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-foreground font-medium text-right">{v}</dd>
                  </div>
                ))}
              </dl>

              {/* Stat strip */}
              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6">
                <div>
                  <p className="text-3xl font-bold text-primary font-mono">
                    {t("facilities.screenStages.detail.statArea")}
                  </p>
                  <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mt-1">
                    {t("facilities.screenStages.detail.statAreaLabel")}
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground font-mono">
                    {t("facilities.screenStages.detail.statGrid")}
                  </p>
                  <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mt-1">
                    {t("facilities.screenStages.detail.statGridLabel")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* CTA */}
      <section className="py-12 border-b border-border text-center" aria-labelledby="sss-cta-heading">
        <h2 id="sss-cta-heading" className="text-xl font-semibold text-foreground mb-6">
          {t("facilities.screenStages.detail.cta")}
        </h2>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 border border-border px-6 py-3 text-sm text-foreground hover:bg-muted transition-colors"
        >
          {t("facilities.screenStages.detail.ctaLink")} →
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
