/**
 * Creative & Ecosystem page component — the integrated creative ecosystem.
 * All text from i18n, all content pre-groundbreaking (future tense).
 */

"use client";

import {
  LandingPageTemplate,
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

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* 1. Ecosystem Model */}
      <section className="py-12 sm:py-16" aria-labelledby="ecosystem-heading">
        <h1 id="ecosystem-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
          {t("creative.ecosystem.heading")}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          {t("creative.ecosystem.summary")}
        </p>
      </section>

      {/* 2. Operating Principles */}
      <section className="py-8" aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="text-xl font-semibold text-foreground">
          {t("creative.ecosystem.principles")}
        </h2>
        <ul className="mt-4 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("creative.ecosystem.principle1")}</li>
          <li className="text-sm text-muted-foreground">{t("creative.ecosystem.principle2")}</li>
          <li className="text-sm text-muted-foreground">{t("creative.ecosystem.principle3")}</li>
          <li className="text-sm text-muted-foreground">{t("creative.ecosystem.principle4")}</li>
          <li className="text-sm text-muted-foreground">{t("creative.ecosystem.principle5")}</li>
        </ul>
      </section>

      {/* 3. Intended Benefits */}
      <section className="py-8" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className="text-xl font-semibold text-foreground">
          {t("creative.ecosystem.benefits")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <p className="text-sm text-muted-foreground">{t("creative.ecosystem.benefit1")}</p>
          <p className="text-sm text-muted-foreground">{t("creative.ecosystem.benefit2")}</p>
          <p className="text-sm text-muted-foreground">{t("creative.ecosystem.benefit3")}</p>
          <p className="text-sm text-muted-foreground">{t("creative.ecosystem.benefit4")}</p>
          <p className="text-sm text-muted-foreground">{t("creative.ecosystem.benefit5")}</p>
          <p className="text-sm text-muted-foreground">{t("creative.ecosystem.benefit6")}</p>
        </div>
      </section>

      {/* 4. Creative Services Grid */}
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

      {/* 5. Case Studies */}
      <section className="py-8" aria-labelledby="case-studies-heading">
        <h2 id="case-studies-heading" className="text-xl font-semibold text-foreground">
          {t("creative.caseStudies.heading")}
        </h2>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("creative.caseStudies.disclaimer")}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="border border-border rounded-md p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("creative.caseStudies.featureFilm")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("creative.caseStudies.featureFilmDesc")}
            </p>
          </div>
          <div className="border border-border rounded-md p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("creative.caseStudies.liveBroadcast")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("creative.caseStudies.liveBroadcastDesc")}
            </p>
          </div>
          <div className="border border-border rounded-md p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("creative.caseStudies.modernTheatre")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("creative.caseStudies.modernTheatreDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* 6. Creative EOI */}
      <div id="eoi-section">
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
