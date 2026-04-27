/**
 * Broadcast Theatre detail page.
 * Route: /facilities/broadcast-theatre
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
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";
import { MEDIA } from "../lib/media-config";
import { FacilityStructuredData } from "../lib/structured-data";

export function FacilityBroadcastTheatrePage() {
  return (
    <I18nProvider>
      <FacilityBroadcastTheatreContent />
    </I18nProvider>
  );
}

function FacilityBroadcastTheatreContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const specs = [
    { k: t("facilities.broadcastTheatre.detail.specTheatre"), v: t("facilities.broadcastTheatre.detail.specTheatreValue") },
    { k: t("facilities.broadcastTheatre.detail.specCabaret"), v: t("facilities.broadcastTheatre.detail.specCabaretValue") },
    { k: t("facilities.broadcastTheatre.detail.specBroadcast"), v: t("facilities.broadcastTheatre.detail.specBroadcastValue") },
    { k: t("facilities.broadcastTheatre.detail.specCameras"), v: t("facilities.broadcastTheatre.detail.specCamerasValue") },
    { k: t("facilities.broadcastTheatre.detail.specLed"), v: t("facilities.broadcastTheatre.detail.specLedValue") },
    { k: t("facilities.broadcastTheatre.detail.specCompliance"), v: t("facilities.broadcastTheatre.detail.specComplianceValue") },
  ];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <FacilityStructuredData
        name="Broadcast Theatre"
        description="Production City Broadcast Theatre — a large-format, acoustically designed performance and broadcast venue supporting live events, screen productions, and hybrid stage-screen presentations."
        slug="broadcast-theatre"
      />
      {/* Hero */}
      {MEDIA["facilities-broadcast-theatre"] && (
        <MediaHero
          lightSrc={MEDIA["facilities-broadcast-theatre"].lightSrc}
          darkSrc={MEDIA["facilities-broadcast-theatre"].darkSrc}
          alt={MEDIA["facilities-broadcast-theatre"].alt}
          width={MEDIA["facilities-broadcast-theatre"].width}
          height={500}
          averageColor={MEDIA["facilities-broadcast-theatre"].averageColor}
          photographer={MEDIA["facilities-broadcast-theatre"].photographer}
          photographerUrl={MEDIA["facilities-broadcast-theatre"].photographerUrl}
          source={MEDIA["facilities-broadcast-theatre"].source}
          sourceUrl={MEDIA["facilities-broadcast-theatre"].sourceUrl}
        >
          <div className="pb-8">
            <p className="text-xs font-mono tracking-widest text-white/60 uppercase mb-4">
              {t("facilities.broadcastTheatre.detail.eyebrow")}
            </p>
            <h1 id="page-heading" className="text-3xl font-semibold text-white sm:text-4xl">
              {t("facilities.broadcastTheatre.detail.heading")}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/80">
              {t("facilities.broadcastTheatre.detail.lead")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* Main content */}
      <ScrollRevealSection delay={0}>
        <section className="py-10 border-b border-border" aria-labelledby="bt-content-heading">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
            {/* Prose */}
            <div className="flex flex-col gap-4">
              <p className="text-base text-foreground leading-relaxed">
                {t("facilities.broadcastTheatre.detail.prose")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("facilities.broadcastTheatre.detail.prose2")}
              </p>

              <div className="mt-4">
                <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">
                  {t("facilities.broadcastTheatre.detail.usageLabel")}
                </p>
                <ul className="flex flex-col gap-2">
                  {(["usage1", "usage2", "usage3"] as const).map((key) => (
                    <li key={key} className="text-sm text-foreground">
                      — {t(`facilities.broadcastTheatre.detail.${key}` as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Spec table */}
            <div>
              <h2 id="bt-content-heading" className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
                {t("facilities.broadcastTheatre.detail.specLabel")}
              </h2>
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
                    {t("facilities.broadcastTheatre.detail.statSeats")}
                  </p>
                  <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mt-1">
                    {t("facilities.broadcastTheatre.detail.statSeatsLabel")}
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground font-mono">
                    {t("facilities.broadcastTheatre.detail.statCameras")}
                  </p>
                  <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mt-1">
                    {t("facilities.broadcastTheatre.detail.statCamerasLabel")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* CTA */}
      <section className="py-12 border-b border-border text-center" aria-labelledby="bt-cta-heading">
        <h2 id="bt-cta-heading" className="text-xl font-semibold text-foreground mb-6">
          {t("facilities.broadcastTheatre.detail.cta")}
        </h2>
        <a
          href="/contact?interest=theatre"
          className="inline-flex items-center gap-2 border border-border px-6 py-3 text-sm text-foreground hover:bg-muted transition-colors"
        >
          {t("facilities.broadcastTheatre.detail.ctaLink")} →
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
