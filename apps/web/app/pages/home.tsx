/**
 * Home page component — the primary entry point for Production City.
 * Hero with media background, persona-aware content sections, contextual CTAs.
 * All text from i18n. Follows Uncodixify guidelines strictly.
 */

"use client";

import { useState, useEffect } from "react";
import {
  LandingPageTemplate,
  EOISection,
  MediaHero,
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

export function HomePage() {
  return (
    <I18nProvider>
      <HomePageContent />
    </I18nProvider>
  );
}

/**
 * RotatingTagline — subtle opacity crossfade between taglines.
 * Max 200ms transition, CSS opacity only (per Uncodixify).
 * Respects prefers-reduced-motion.
 */
function RotatingTagline({ taglines }: { taglines: string[] }) {
  const [index, setIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || taglines.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [taglines.length, prefersReducedMotion]);

  if (taglines.length === 0) return null;
  if (prefersReducedMotion || taglines.length === 1) {
    return <span>{taglines[0]}</span>;
  }

  return (
    <span className="relative inline-block" aria-live="polite" aria-atomic="true">
      {taglines.map((tagline, i) => (
        <span
          key={tagline}
          className="transition-opacity duration-200 ease-in-out"
          style={{
            opacity: i === index ? 1 : 0,
            position: i === 0 ? "relative" : "absolute",
            top: i === 0 ? undefined : 0,
            left: i === 0 ? undefined : 0,
          }}
          aria-hidden={i !== index}
        >
          {tagline}
        </span>
      ))}
    </span>
  );
}

function HomePageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const heroMedia = MEDIA["home-hero"];
  const facilitiesMedia = MEDIA["home-facilities-preview"];
  const creativeMedia = MEDIA["home-creative-preview"];
  const visionMedia = MEDIA["home-vision-preview"];

  const taglines = [
    t("home.intro.tagline"),
    t("home.intro.tagline2"),
    t("home.intro.tagline3"),
  ].filter((s) => s && !s.startsWith("home.intro.tagline"));

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* 1. Hero — max 60vh per review finding #31 */}
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
              {t("home.intro.brand")}
            </h1>
            <p className="mt-2 text-lg text-white/90 sm:text-xl">
              <RotatingTagline taglines={taglines.length > 0 ? taglines : [t("home.intro.tagline")]} />
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/facilities"
                className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
              >
                {t("home.intro.ctaSecondary")}
              </a>
              <a
                href="#eoi-section"
                className="inline-flex items-center justify-center rounded-sm border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/20"
              >
                {t("home.intro.ctaPrimary")}
              </a>
            </div>
          </div>
        </MediaHero>
      )}

      {/* 2. What is Production City? */}
      <section className="py-12" aria-labelledby="what-heading">
        <h2 id="what-heading" className="text-xl font-semibold text-foreground sm:text-2xl">
          {t("home.whatIs.heading")}
        </h2>
        <p className="mt-3 max-w-3xl text-base text-muted-foreground">
          {t("home.intro.positioning")}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border-l-2 border-primary pl-4">
            <p className="text-sm text-foreground">{t("home.whatIs.claim1")}</p>
          </div>
          <div className="border-l-2 border-primary pl-4">
            <p className="text-sm text-foreground">{t("home.whatIs.claim2")}</p>
          </div>
          <div className="border-l-2 border-secondary pl-4">
            <p className="text-sm text-foreground">{t("home.whatIs.claim3")}</p>
          </div>
          <div className="border-l-2 border-secondary pl-4">
            <p className="text-sm text-foreground">{t("home.whatIs.claim4")}</p>
          </div>
        </div>
      </section>

      {/* 3. Facilities Preview — for Producers */}
      <section className="py-10 border-t border-border" aria-labelledby="facilities-preview-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          {facilitiesMedia && (
            <div className="overflow-hidden rounded-sm">
              <img
                src={facilitiesMedia.lightSrc}
                alt={facilitiesMedia.alt}
                width={facilitiesMedia.width}
                height={facilitiesMedia.height}
                loading="lazy"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "16 / 9" }}
              />
            </div>
          )}
          <div>
            <h2 id="facilities-preview-heading" className="text-xl font-semibold text-foreground">
              {t("home.facilitiesPreview.heading")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("facilities.screenStages.description")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("facilities.commercialStages.description")}
            </p>
            <a
              href="/facilities"
              className="mt-4 inline-flex items-center text-sm font-medium text-primary underline underline-offset-4 transition-colors duration-150 hover:text-primary/80"
            >
              {t("home.facilitiesPreview.viewAll")}
            </a>
          </div>
        </div>
      </section>

      {/* 4. Creative Ecosystem — for Creative Professionals */}
      <section className="py-10 border-t border-border" aria-labelledby="creative-preview-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <h2 id="creative-preview-heading" className="text-xl font-semibold text-foreground">
              {t("home.creativePreview.heading")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("home.creativePreview.description")}
            </p>
            <a
              href="/creative"
              className="mt-4 inline-flex items-center text-sm font-medium text-primary underline underline-offset-4 transition-colors duration-150 hover:text-primary/80"
            >
              {t("home.creativePreview.viewAll")}
            </a>
          </div>
          {creativeMedia && (
            <div className="order-1 overflow-hidden rounded-sm lg:order-2">
              <img
                src={creativeMedia.lightSrc}
                alt={creativeMedia.alt}
                width={creativeMedia.width}
                height={creativeMedia.height}
                loading="lazy"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "16 / 9" }}
              />
            </div>
          )}
        </div>
      </section>

      {/* 5. Global Vision — for Investors, Government */}
      <section className="py-10 border-t border-border" aria-labelledby="vision-preview-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          {visionMedia && (
            <div className="overflow-hidden rounded-sm">
              <img
                src={visionMedia.lightSrc}
                alt={visionMedia.alt}
                width={visionMedia.width}
                height={visionMedia.height}
                loading="lazy"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "16 / 9" }}
              />
            </div>
          )}
          <div>
            <h2 id="vision-preview-heading" className="text-xl font-semibold text-foreground">
              {t("home.visionTeaser.heading")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("home.visionTeaser.description")}
            </p>
            <a
              href="/vision"
              className="mt-4 inline-flex items-center text-sm font-medium text-primary underline underline-offset-4 transition-colors duration-150 hover:text-primary/80"
            >
              {t("home.visionTeaser.viewAll")}
            </a>
          </div>
        </div>
      </section>

      {/* 6. Community — for Education, Government */}
      <section className="py-10 border-t border-border" aria-labelledby="community-preview-heading">
        <h2 id="community-preview-heading" className="text-xl font-semibold text-foreground">
          {t("home.communityPreview.heading")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {t("home.communityPreview.description")}
        </p>
        <a
          href="/community"
          className="mt-4 inline-flex items-center text-sm font-medium text-primary underline underline-offset-4 transition-colors duration-150 hover:text-primary/80"
        >
          {t("home.communityPreview.viewAll")}
        </a>
      </section>

      {/* 7. Acknowledgement of Country */}
      <section className="border-t border-border py-8" aria-labelledby="acknowledgement-heading">
        <h2 id="acknowledgement-heading" className="text-sm font-semibold text-foreground">
          {t("home.acknowledgement.heading")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("footer.acknowledgement")}
        </p>
      </section>

      {/* 8. Expression of Interest — All Personas */}
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
