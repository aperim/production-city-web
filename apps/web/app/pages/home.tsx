/**
 * Home page component — renders all sections of the home landing page.
 * All text from i18n, all content pre-groundbreaking (future tense).
 */

"use client";

import {
  LandingPageTemplate,
  EOISection,
  FacilityShowcase,
} from "@productioncity/holding-ui";
import { useTranslation } from "../i18n/context";
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";

export function HomePage() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* 1. Introduction */}
      <section className="py-12 sm:py-16" aria-labelledby="intro-heading">
        <p className="text-sm font-medium text-muted-foreground">
          {t("home.intro.tagline")}
        </p>
        <h1 id="intro-heading" className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Production City
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          {t("home.intro.positioning")}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href="#eoi-section"
            className="inline-flex items-center justify-center rounded-sm border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors duration-150 hover:bg-foreground/90"
          >
            {t("home.intro.ctaPrimary")}
          </a>
          <a
            href="/facilities"
            className="inline-flex items-center justify-center rounded-sm border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted"
          >
            {t("home.intro.ctaSecondary")}
          </a>
        </div>
      </section>

      {/* 2. What is Production City? */}
      <section className="py-8" aria-labelledby="what-heading">
        <h2 id="what-heading" className="text-xl font-semibold text-foreground">
          {t("home.whatIs.heading")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <p className="text-sm text-muted-foreground">{t("home.whatIs.claim1")}</p>
          <p className="text-sm text-muted-foreground">{t("home.whatIs.claim2")}</p>
          <p className="text-sm text-muted-foreground">{t("home.whatIs.claim3")}</p>
          <p className="text-sm text-muted-foreground">{t("home.whatIs.claim4")}</p>
        </div>
      </section>

      {/* 3. Facilities Preview */}
      <FacilityShowcase
        heading={t("home.facilitiesPreview.heading")}
        facilities={[
          {
            name: t("facilities.screenStages.name"),
            description: t("facilities.screenStages.description"),
            href: "/facilities",
          },
          {
            name: t("facilities.commercialStages.name"),
            description: t("facilities.commercialStages.description"),
            href: "/facilities",
          },
          {
            name: t("facilities.broadcastTheatre.name"),
            description: t("facilities.broadcastTheatre.description"),
            href: "/facilities",
          },
        ]}
      />
      <p className="-mt-4 pb-4">
        <a
          href="/facilities"
          className="text-sm font-medium text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-muted-foreground"
        >
          {t("home.facilitiesPreview.viewAll")}
        </a>
      </p>

      {/* 4. Creative Ecosystem Preview */}
      <section className="py-8" aria-labelledby="creative-heading">
        <h2 id="creative-heading" className="text-xl font-semibold text-foreground">
          {t("home.creativePreview.heading")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("home.creativePreview.description")}
        </p>
        <p className="mt-4">
          <a
            href="/creative"
            className="text-sm font-medium text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-muted-foreground"
          >
            {t("home.creativePreview.viewAll")}
          </a>
        </p>
      </section>

      {/* 5. Global Vision Teaser */}
      <section className="py-8" aria-labelledby="vision-heading">
        <h2 id="vision-heading" className="text-xl font-semibold text-foreground">
          {t("home.visionTeaser.heading")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("home.visionTeaser.description")}
        </p>
        <p className="mt-4">
          <a
            href="/vision"
            className="text-sm font-medium text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-muted-foreground"
          >
            {t("home.visionTeaser.viewAll")}
          </a>
        </p>
      </section>

      {/* 6. Acknowledgement of Country */}
      <section className="border-t border-border py-8" aria-labelledby="acknowledgement-heading">
        <h2 id="acknowledgement-heading" className="text-sm font-semibold text-foreground">
          {t("home.acknowledgement.heading")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("footer.acknowledgement")}
        </p>
      </section>

      {/* 7. General EOI */}
      <div id="eoi-section">
        <EOISection
          heading={t("home.eoi.heading")}
          contextText={t("home.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory="general"
          onSubmit={handleEoiSubmit}
        />
      </div>
    </LandingPageTemplate>
  );
}
