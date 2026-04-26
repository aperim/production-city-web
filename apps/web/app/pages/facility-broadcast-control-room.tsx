/**
 * Broadcast Control Room detail page.
 * Route: /facilities/broadcast-control-room
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

export function FacilityBroadcastControlRoomPage() {
  return (
    <I18nProvider>
      <FacilityBroadcastControlRoomContent />
    </I18nProvider>
  );
}

function FacilityBroadcastControlRoomContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const capabilities = [
    t("facilities.controlRoom.detail.cap1"),
    t("facilities.controlRoom.detail.cap2"),
    t("facilities.controlRoom.detail.cap3"),
    t("facilities.controlRoom.detail.cap4"),
    t("facilities.controlRoom.detail.cap5"),
  ];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* Hero */}
      {MEDIA["facilities-control-room"] && (
        <MediaHero
          lightSrc={MEDIA["facilities-control-room"].lightSrc}
          darkSrc={MEDIA["facilities-control-room"].darkSrc}
          alt={MEDIA["facilities-control-room"].alt}
          width={MEDIA["facilities-control-room"].width}
          height={500}
          averageColor={MEDIA["facilities-control-room"].averageColor}
          photographer={MEDIA["facilities-control-room"].photographer}
          photographerUrl={MEDIA["facilities-control-room"].photographerUrl}
          source={MEDIA["facilities-control-room"].source}
          sourceUrl={MEDIA["facilities-control-room"].sourceUrl}
        >
          <div className="pb-8">
            <p className="text-xs font-mono tracking-widest text-white/60 uppercase mb-4">
              {t("facilities.controlRoom.detail.eyebrow")}
            </p>
            <h1 id="page-heading" className="text-3xl font-semibold text-white sm:text-4xl">
              {t("facilities.controlRoom.detail.heading")}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/80">
              {t("facilities.controlRoom.detail.lead")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* Main content */}
      <ScrollRevealSection delay={0}>
        <section className="py-10 border-b border-border" aria-labelledby="bcr-content-heading">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
            {/* Prose */}
            <div className="flex flex-col gap-4">
              <p className="text-base text-foreground leading-relaxed" style={{ fontFamily: "var(--font-serif, serif)" }}>
                {t("facilities.controlRoom.detail.prose")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("facilities.controlRoom.detail.prose2")}
              </p>
            </div>

            {/* Capabilities list */}
            <div>
              <h2 id="bcr-content-heading" className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
                {t("facilities.controlRoom.detail.capabilityLabel")}
              </h2>
              <ul className="flex flex-col divide-y divide-border">
                {capabilities.map((cap) => (
                  <li key={cap} className="py-4 text-sm text-foreground font-mono tracking-wide">
                    → {cap}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* CTA */}
      <section className="py-12 border-b border-border text-center" aria-labelledby="bcr-cta-heading">
        <h2 id="bcr-cta-heading" className="text-xl font-semibold text-foreground mb-6">
          {t("facilities.controlRoom.detail.cta")}
        </h2>
        <a
          href="/contact?interest=broadcast"
          className="inline-flex items-center gap-2 border border-border px-6 py-3 text-sm text-foreground hover:bg-muted transition-colors"
        >
          {t("facilities.controlRoom.detail.ctaLink")} →
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
