/**
 * Commercial Sound Stages detail page.
 * Route: /facilities/commercial-sound-stages
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

export function FacilityCommercialSoundStagesPage() {
  return (
    <I18nProvider>
      <FacilityCommercialSoundStagesContent />
    </I18nProvider>
  );
}

function FacilityCommercialSoundStagesContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const specs = [
    { k: t("facilities.commercialStages.detail.specDimensions"), v: t("facilities.commercialStages.detail.specDimensionsValue") },
    { k: t("facilities.commercialStages.detail.specArea"), v: t("facilities.commercialStages.detail.specAreaValue") },
    { k: t("facilities.commercialStages.detail.specHeight"), v: t("facilities.commercialStages.detail.specHeightValue") },
    { k: t("facilities.commercialStages.detail.specSoundproofing"), v: t("facilities.commercialStages.detail.specSoundproofingValue") },
    { k: t("facilities.commercialStages.detail.specLed"), v: t("facilities.commercialStages.detail.specLedValue") },
    { k: t("facilities.commercialStages.detail.specGrid"), v: t("facilities.commercialStages.detail.specGridValue") },
  ];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* Hero */}
      <section className="py-16 border-b border-border" aria-labelledby="page-heading">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
          {t("facilities.commercialStages.detail.eyebrow")}
        </p>
        <h1 id="page-heading" className="text-3xl font-semibold text-foreground sm:text-4xl">
          {t("facilities.commercialStages.detail.heading")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {t("facilities.commercialStages.detail.lead")}
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
                {t("facilities.commercialStages.detail.prose")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("facilities.commercialStages.detail.prose2")}
              </p>

              <div className="mt-4">
                <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">
                  {t("facilities.commercialStages.detail.usageLabel")}
                </p>
                <ul className="flex flex-col gap-2">
                  {(["usage1", "usage2", "usage3"] as const).map((key) => (
                    <li key={key} className="text-sm text-foreground">
                      — {t(`facilities.commercialStages.detail.${key}` as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Spec table */}
            <div>
              <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
                {t("facilities.commercialStages.detail.specLabel")}
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
                    {t("facilities.commercialStages.detail.statArea")}
                  </p>
                  <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mt-1">
                    {t("facilities.commercialStages.detail.statAreaLabel")}
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground font-mono">
                    {t("facilities.commercialStages.detail.statGrid")}
                  </p>
                  <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mt-1">
                    {t("facilities.commercialStages.detail.statGridLabel")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* Sibling navigation */}
      <nav className="py-6 border-b border-border flex flex-wrap gap-6 text-xs font-mono tracking-widest text-muted-foreground uppercase" aria-label="Facility navigation">
        <a href="/facilities/screen-sound-stages" className="border-b border-current pb-1 hover:text-foreground transition-colors">
          ← A · Screen stages
        </a>
        <a href="/facilities/broadcast-theatre" className="border-b border-current pb-1 hover:text-foreground transition-colors">
          C · Broadcast theatre →
        </a>
      </nav>

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
