/**
 * Creative & Ecosystem page — the integrated creative ecosystem.
 * Hero with media, service areas grid, illustrative scenarios.
 * All text from i18n, all content pre-groundbreaking (future tense).
 */

"use client";

import {
  LandingPageTemplate,
  MediaHero,
  ServiceGrid,
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
import { MEDIA } from "../lib/media-config";

export function CreativePage() {
  return (
    <I18nProvider>
      <CreativePageContent />
    </I18nProvider>
  );
}

function CreativePageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const heroMedia = MEDIA["creative-hero"];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* Hero */}
      {heroMedia && (
        <MediaHero
          lightSrc={heroMedia.lightSrc}
          darkSrc={heroMedia.darkSrc}
          alt={heroMedia.alt}
          width={heroMedia.width}
          height={heroMedia.height}
          averageColor={heroMedia.averageColor}
          photographer={heroMedia.photographer}
          source={heroMedia.source}
          className="max-h-[60vh] -mx-4 sm:-mx-6"
        >
          <div className="pb-8">
            <h1 id="page-heading" className="text-3xl font-semibold text-white sm:text-4xl">
              {t("creative.ecosystem.heading")}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-white/90">
              {t("creative.ecosystem.summary")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* Operating Principles */}
      <section className="py-10" aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="text-xl font-semibold text-foreground">
          {t("creative.ecosystem.principles")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="border-l-2 border-primary pl-4 py-1">
              <p className="text-sm text-foreground">{t(`creative.ecosystem.principle${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-10 border-t border-border" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className="text-xl font-semibold text-foreground">
          {t("creative.ecosystem.benefits")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="border border-border rounded-sm p-4">
              <p className="text-sm text-foreground">{t(`creative.ecosystem.benefit${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Creative Services — with media sections */}
      <section className="py-10 border-t border-border" aria-labelledby="services-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <ServiceGrid
              heading={t("creative.services.heading")}
              services={[
                { name: t("creative.services.stuntRigging"), description: t("creative.services.stuntRiggingDesc") },
                { name: t("creative.services.audioMusic"), description: t("creative.services.audioMusicDesc") },
                { name: t("creative.services.scriptScreenplay"), description: t("creative.services.scriptScreenplayDesc") },
                { name: t("creative.services.graphicDesign"), description: t("creative.services.graphicDesignDesc") },
                { name: t("creative.services.animation"), description: t("creative.services.animationDesc") },
                { name: t("creative.services.postEditing"), description: t("creative.services.postEditingDesc") },
                { name: t("creative.services.modelling3d"), description: t("creative.services.modelling3dDesc") },
                { name: t("creative.services.motionCapture"), description: t("creative.services.motionCaptureDesc") },
                { name: t("creative.services.arVr"), description: t("creative.services.arVrDesc") },
                { name: t("creative.services.broadcastCoord"), description: t("creative.services.broadcastCoordDesc") },
                { name: t("creative.services.specialEffects"), description: t("creative.services.specialEffectsDesc") },
                { name: t("creative.services.virtualProd"), description: t("creative.services.virtualProdDesc") },
                { name: t("creative.services.conceptDev"), description: t("creative.services.conceptDevDesc") },
                { name: t("creative.services.setConstruc"), description: t("creative.services.setConstructDesc") },
                { name: t("creative.services.propsDesign"), description: t("creative.services.propsDesignDesc") },
                { name: t("creative.services.costumeDesign"), description: t("creative.services.costumeDesignDesc") },
                { name: t("creative.services.makeupProsthetics"), description: t("creative.services.makeupProstheticsDesc") },
              ]}
            />
          </div>
          <div className="flex flex-col gap-4">
            {MEDIA["creative-vfx"] && (
              <div className="overflow-hidden rounded-sm">
                <img
                  src={MEDIA["creative-vfx"].lightSrc}
                  alt={MEDIA["creative-vfx"].alt}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  className="h-auto w-full object-cover"
                  style={{ aspectRatio: "16 / 9" }}
                />
              </div>
            )}
            {MEDIA["creative-post-production"] && (
              <div className="overflow-hidden rounded-sm">
                <img
                  src={MEDIA["creative-post-production"].lightSrc}
                  alt={MEDIA["creative-post-production"].alt}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  className="h-auto w-full object-cover"
                  style={{ aspectRatio: "16 / 9" }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Illustrative Scenarios — labeled per review finding #24 */}
      <section className="py-10 border-t border-border" aria-labelledby="scenarios-heading">
        <h2 id="scenarios-heading" className="text-xl font-semibold text-foreground">
          {t("creative.caseStudies.heading")}
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("creative.caseStudies.disclaimer")}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {["featureFilm", "liveBroadcast", "modernTheatre"].map((key) => (
            <div key={key} className="border border-border rounded-sm p-4">
              <h3 className="text-sm font-semibold text-foreground">
                {t(`creative.caseStudies.${key}` as Parameters<typeof t>[0])}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`creative.caseStudies.${key}Desc` as Parameters<typeof t>[0])}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Creative EOI */}
      <div id="eoi-section" className="border-t border-border">
        <EOISection
          heading={t("creative.eoi.heading")}
          contextText={t("creative.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory="creative"
          onSubmit={handleEoiSubmit}
        />
      </div>
    </LandingPageTemplate>
  );
}
