/**
 * Creative & Ecosystem page — the integrated creative ecosystem.
 * Hero with media, discipline-specific sections, 17-discipline grid,
 * 4 case studies, forward-looking disclaimer. All text from i18n.
 */

"use client";

import {
  LandingPageTemplate,
  MediaHero,
  ServiceGrid,
  ForwardLookingDisclaimer,
  EOISection,
  ScrollRevealSection,
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
import { SimpleWebPageStructuredData } from "../lib/structured-data";

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
      <SimpleWebPageStructuredData
        name="Creative Ecosystem — Production City"
        description="Production City's integrated creative ecosystem: 17 disciplines, purpose-built facilities, and a collaborative campus designed for screen and stage productions."
        path="/creative"
      />
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
      <ScrollRevealSection delay={0}>
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
      </ScrollRevealSection>

      {/* VFX & Digital — with media */}
      <ScrollRevealSection delay={100}>
      <section className="py-10 border-t border-border" aria-labelledby="vfx-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
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
          <div>
            <h2 id="vfx-heading" className="text-xl font-semibold text-foreground">
              {t("creative.services.modelling3d")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("creative.services.modelling3dDesc")}
            </p>
          </div>
        </div>
      </section>
      </ScrollRevealSection>

      {/* Post-Production — with media */}
      <ScrollRevealSection delay={100}>
      <section className="py-10 border-t border-border" aria-labelledby="post-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div className="order-2 lg:order-1">
            <h2 id="post-heading" className="text-xl font-semibold text-foreground">
              {t("creative.services.postEditing")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("creative.services.postEditingDesc")}
            </p>
          </div>
          {MEDIA["creative-post-production"] && (
            <div className="order-1 overflow-hidden rounded-sm lg:order-2">
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
      </section>
      </ScrollRevealSection>

      {/* Motion Capture — with media */}
      <ScrollRevealSection delay={200}>
      <section className="py-10 border-t border-border" aria-labelledby="mocap-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          {MEDIA["creative-motion-capture"] && (
            <div className="overflow-hidden rounded-sm">
              <img
                src={MEDIA["creative-motion-capture"].lightSrc}
                alt={MEDIA["creative-motion-capture"].alt}
                width={1920}
                height={1080}
                loading="lazy"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "16 / 9" }}
              />
            </div>
          )}
          <div>
            <h2 id="mocap-heading" className="text-xl font-semibold text-foreground">
              {t("creative.services.motionCapture")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("creative.services.motionCaptureDesc")}
            </p>
          </div>
        </div>
      </section>
      </ScrollRevealSection>

      {/* Costume & Props — with media */}
      <ScrollRevealSection delay={100}>
      <section className="py-10 border-t border-border" aria-labelledby="costume-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div className="order-2 lg:order-1">
            <h2 id="costume-heading" className="text-xl font-semibold text-foreground">
              {t("creative.services.costumeDesign")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("creative.services.costumeDesignDesc")}
            </p>
          </div>
          {MEDIA["creative-costume"] && (
            <div className="order-1 overflow-hidden rounded-sm lg:order-2">
              <img
                src={MEDIA["creative-costume"].lightSrc}
                alt={MEDIA["creative-costume"].alt}
                width={1920}
                height={1080}
                loading="lazy"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "16 / 9" }}
              />
            </div>
          )}
        </div>
      </section>
      </ScrollRevealSection>

      {/* Benefits */}
      <ScrollRevealSection delay={100}>
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
      </ScrollRevealSection>

      {/* Creative Services — 17 disciplines grid */}
      <ScrollRevealSection delay={100}>
      <section className="py-10 border-t border-border" aria-labelledby="services-heading">
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
      </section>
      </ScrollRevealSection>

      {/* Illustrative Scenarios — 4 case studies */}
      <ScrollRevealSection delay={200}>
      <section className="py-10 border-t border-border" aria-labelledby="scenarios-heading">
        <h2 id="scenarios-heading" className="text-xl font-semibold text-foreground">
          {t("creative.caseStudies.heading")}
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("creative.caseStudies.disclaimer")}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {["featureFilm", "liveBroadcast", "internationalCollab", "modernTheatre"].map((key) => (
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
      </ScrollRevealSection>

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

      {/* Forward-Looking Disclaimer */}
      <ForwardLookingDisclaimer text={t("creative.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
