/**
 * Home page component — the primary entry point for Production City.
 * Cinematic hero, scroll-reveal sections, integrated EOI form.
 * All text from i18n. Uses Phase 1 components exclusively.
 */

"use client";

import {
  CinematicHero,
  ScrollRevealSection,
  MediaPanel,
  StatementBlock,
  BrandAccentDivider,
  EOISection,
  AcknowledgementOfCountry,
  LandingPageTemplate,
  useParallax,
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

function HomePageContent() {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const { ref: parallaxRef, offset: parallaxOffset } = useParallax<HTMLDivElement>({ maxOffset: 15 });

  const heroMedia = MEDIA["home-hero"];
  const facilitiesMedia = MEDIA["home-facilities-preview"];
  const creativeMedia = MEDIA["home-creative-preview"];
  const visionMedia = MEDIA["home-vision-preview"];

  return (
    <LandingPageTemplate nav={{ ...nav, transparent: true }} footer={footer}>
      {/* 1. Hero — CinematicHero at full viewport with parallax */}
      {heroMedia && (
        <div ref={parallaxRef}>
          <CinematicHero
            imageSrc={heroMedia.darkSrc}
            imageAlt={heroMedia.alt}
            title={t("home.intro.tagline")}
            subtitle={t("home.intro.tagline3")}
            height="full"
            overlay="dark"
            parallaxOffset={parallaxOffset}
            attribution={{
              photographer: heroMedia.photographer,
              source: heroMedia.source,
            }}
            ctas={[
              {
                label: t("home.intro.ctaSecondary"),
                href: `${prefix}/facilities`,
                variant: "primary",
              },
              {
                label: t("home.intro.ctaPrimary"),
                href: "#eoi-section",
                variant: "secondary",
              },
            ]}
          />
        </div>
      )}

      {/* 2. What Is Production City — StatementBlock */}
      <ScrollRevealSection delay={0}>
        <StatementBlock
          text={t("home.whatIs.claim1")}
          accent="primary"
        />
      </ScrollRevealSection>

      <BrandAccentDivider variant="gradient" width="centered" />

      {/* 3. Facilities Preview — MediaPanel (image left) */}
      <ScrollRevealSection delay={100}>
        <MediaPanel
          imageSrc={facilitiesMedia?.darkSrc ?? ""}
          imageAlt={facilitiesMedia?.alt ?? ""}
          imagePosition="left"
          attribution={facilitiesMedia ? {
            photographer: facilitiesMedia.photographer,
            source: facilitiesMedia.source,
          } : undefined}
        >
          <h2 className="text-xl font-semibold text-foreground">
            {t("home.facilitiesPreview.heading")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("home.whatIs.claim2")}
          </p>
          <a
            href={`${prefix}/facilities`}
            className="mt-4 inline-flex items-center text-sm font-medium text-[var(--color-primary)] underline underline-offset-4"
          >
            {t("home.facilitiesPreview.viewAll")}
          </a>
        </MediaPanel>
      </ScrollRevealSection>

      <BrandAccentDivider variant="gradient" width="centered" />

      {/* 4. Creative Ecosystem — MediaPanel (image right) */}
      <ScrollRevealSection delay={100}>
        <MediaPanel
          imageSrc={creativeMedia?.darkSrc ?? ""}
          imageAlt={creativeMedia?.alt ?? ""}
          imagePosition="right"
          attribution={creativeMedia ? {
            photographer: creativeMedia.photographer,
            source: creativeMedia.source,
          } : undefined}
        >
          <h2 className="text-xl font-semibold text-foreground">
            {t("home.creativePreview.heading")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("home.creativePreview.description")}
          </p>
          <a
            href={`${prefix}/creative`}
            className="mt-4 inline-flex items-center text-sm font-medium text-[var(--color-primary)] underline underline-offset-4"
          >
            {t("home.creativePreview.viewAll")}
          </a>
        </MediaPanel>
      </ScrollRevealSection>

      <BrandAccentDivider variant="gradient" width="centered" />

      {/* 5. Global Vision — MediaPanel (image left) */}
      <ScrollRevealSection delay={100}>
        <MediaPanel
          imageSrc={visionMedia?.darkSrc ?? ""}
          imageAlt={visionMedia?.alt ?? ""}
          imagePosition="left"
          attribution={visionMedia ? {
            photographer: visionMedia.photographer,
            source: visionMedia.source,
          } : undefined}
        >
          <h2 className="text-xl font-semibold text-foreground">
            {t("home.visionTeaser.heading")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("home.visionTeaser.description")}
          </p>
          <a
            href={`${prefix}/vision`}
            className="mt-4 inline-flex items-center text-sm font-medium text-[var(--color-primary)] underline underline-offset-4"
          >
            {t("home.visionTeaser.viewAll")}
          </a>
        </MediaPanel>
      </ScrollRevealSection>

      <BrandAccentDivider variant="gradient" width="centered" />

      {/* 6. Community */}
      <ScrollRevealSection delay={200}>
        <section className="py-12 px-6" aria-labelledby="community-preview-heading">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="community-preview-heading" className="text-xl font-semibold text-foreground">
              {t("home.communityPreview.heading")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("home.communityPreview.description")}
            </p>
            <a
              href={`${prefix}/community`}
              className="mt-4 inline-flex items-center text-sm font-medium text-[var(--color-primary)] underline underline-offset-4"
            >
              {t("home.communityPreview.viewAll")}
            </a>
          </div>
        </section>
      </ScrollRevealSection>

      {/* 7. Acknowledgement of Country — shared component (Finding #22) */}
      <ScrollRevealSection direction="fade">
        <AcknowledgementOfCountry
          heading={t("home.acknowledgement.heading")}
          text={t("footer.acknowledgement")}
        />
      </ScrollRevealSection>

      {/* 8. Expression of Interest */}
      <ScrollRevealSection delay={100}>
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
      </ScrollRevealSection>
    </LandingPageTemplate>
  );
}
