/**
 * Community & Engagement page — education, sustainability, innovation,
 * acknowledgement of country, and partnerships.
 * Hero with media, community sections, education/government CTAs.
 * All text from i18n.
 */

"use client";

import {
  LandingPageTemplate,
  MediaHero,
  ForwardLookingDisclaimer,
  EOISection,
  AcknowledgementOfCountry,
  ScrollRevealSection,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import type { SupportedLocale } from "../i18n/index.js";
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";
import { MEDIA } from "../lib/media-config";
import { NoIndexMeta } from "../lib/structured-data";


interface CommunityPageProps {
  serverLocale?: SupportedLocale;
}

export function CommunityPage({ serverLocale }: CommunityPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <CommunityPageContent />
    </I18nProvider>
  );
}

function CommunityPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const heroMedia = MEDIA["community-hero"];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <NoIndexMeta />
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
              {t("community.heading")}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-white/90">
              {t("community.intro")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* Education & Innovation with media */}
      <ScrollRevealSection delay={0}>
      <section className="py-10" aria-labelledby="education-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 id="education-heading" className="text-xl font-semibold text-foreground">
              {t("community.education.heading")}
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="border-l-2 border-primary pl-4 py-1">
                  <p className="text-sm text-foreground">{t(`community.education.strategy${n}` as Parameters<typeof t>[0])}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-base font-semibold text-foreground">
              {t("community.education.rdHeading")}
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {[1, 2, 3].map((n) => (
                <p key={n} className="text-sm text-muted-foreground">{t(`community.education.rd${n}` as Parameters<typeof t>[0])}</p>
              ))}
            </div>
          </div>
          {MEDIA["community-education"] && (
            <div className="overflow-hidden rounded-sm">
              <img
                src={MEDIA["community-education"].lightSrc}
                alt={MEDIA["community-education"].alt}
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

      {/* Sustainability with media */}
      <ScrollRevealSection delay={100}>
      <section className="py-10 border-t border-border" aria-labelledby="sustainability-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          {MEDIA["community-sustainability"] && (
            <div className="overflow-hidden rounded-sm">
              <img
                src={MEDIA["community-sustainability"].lightSrc}
                alt={MEDIA["community-sustainability"].alt}
                width={1920}
                height={1080}
                loading="lazy"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "16 / 9" }}
              />
            </div>
          )}
          <div>
            <h2 id="sustainability-heading" className="text-xl font-semibold text-foreground">
              {t("community.sustainability.heading")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("community.sustainability.goal")}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="border-l-2 border-primary pl-4 py-1">
                  <p className="text-sm text-foreground">{t(`community.sustainability.principle${n}` as Parameters<typeof t>[0])}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </ScrollRevealSection>

      {/* Innovation — StatementBlock style */}
      <section className="py-10 border-t border-border" aria-labelledby="innovation-heading">
        <h2 id="innovation-heading" className="text-xl font-semibold text-foreground">
          {t("community.innovation.heading")}
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
          {t("community.innovation.statement")}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border border-border rounded-sm p-3">
              <p className="text-sm text-foreground">{t(`community.education.crossSector${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Synergies & Opportunities */}
      <section className="py-10 border-t border-border" aria-labelledby="synergies-heading">
        <h2 id="synergies-heading" className="text-xl font-semibold text-foreground">
          {t("community.synergies.heading")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {["creators", "industry", "investors", "communities"].map((key) => (
            <div key={key} className="border border-border rounded-sm p-4">
              <h3 className="text-sm font-semibold text-foreground">
                {t(`community.synergies.${key}` as Parameters<typeof t>[0])}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`community.synergies.${key}Items` as Parameters<typeof t>[0])}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Alliances */}
      <section className="py-10 border-t border-border" aria-labelledby="alliances-heading">
        <h2 id="alliances-heading" className="text-xl font-semibold text-foreground">
          {t("community.alliances.heading")}
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="border-l-2 border-primary pl-4 py-1">
              <p className="text-sm text-foreground">{t(`community.alliances.type${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
        <h3 className="mt-6 text-base font-semibold text-foreground">
          {t("community.alliances.valueHeading")}
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border border-border rounded-sm p-3">
              <p className="text-sm text-foreground">{t(`community.alliances.value${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Building Bridges */}
      <section className="py-10 border-t border-border" aria-labelledby="bridges-heading">
        <h2 id="bridges-heading" className="text-xl font-semibold text-foreground">
          {t("community.bridges.heading")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {t("community.bridges.producers")}
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {[1, 2, 3, 4].map((n) => (
                <p key={n} className="text-sm text-muted-foreground">{t(`community.bridges.producer${n}` as Parameters<typeof t>[0])}</p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {t("community.bridges.government")}
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <p key={n} className="text-sm text-muted-foreground">{t(`community.bridges.gov${n}` as Parameters<typeof t>[0])}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Acknowledgement of Country — shared molecule (Finding #22) */}
      <AcknowledgementOfCountry
        heading={t("community.acknowledgement.heading")}
        text={t("community.acknowledgement.text")}
      />

      {/* Community EOI */}
      <div id="eoi-section" className="border-t border-border">
        <EOISection
          heading={t("community.eoi.heading")}
          contextText={t("community.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory="education"
          onSubmit={handleEoiSubmit}
        />
      </div>

      {/* Forward-Looking Disclaimer */}
      <ForwardLookingDisclaimer text={t("community.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
