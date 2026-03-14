/**
 * Vision & Global Network page — global vision, market position, and stakeholders.
 * Hero with media, global footprint, team, investor-focused CTAs.
 * All text from i18n, all content pre-groundbreaking (future tense).
 */

"use client";

import {
  LandingPageTemplate,
  MediaHero,
  GlobalCampusMap,
  StakeholderGrid,
  ForwardLookingDisclaimer,
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

export function VisionPage() {
  return (
    <I18nProvider>
      <VisionPageContent />
    </I18nProvider>
  );
}

function VisionPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const heroMedia = MEDIA["vision-hero"];

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
              {t("vision.mission.heading")}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-white/90">
              {t("vision.mission.vision")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* Mission Themes */}
      <section className="py-10" aria-labelledby="themes-heading">
        <h2 id="themes-heading" className="text-xl font-semibold text-foreground">
          {t("vision.mission.themes")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div key={n} className="border-l-2 border-primary pl-4 py-1">
              <p className="text-sm text-foreground">{t(`vision.mission.theme${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-10 border-t border-border" aria-labelledby="philosophy-heading">
        <h2 id="philosophy-heading" className="text-xl font-semibold text-foreground">
          {t("vision.mission.philosophy")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border border-border rounded-sm p-4">
              <p className="text-sm text-foreground">{t(`vision.mission.phil${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Global Campus Network with media */}
      <section className="py-10 border-t border-border" aria-labelledby="global-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <GlobalCampusMap
              heading={t("vision.global.heading")}
              locations={[
                {
                  name: t("vision.global.queensland"),
                  status: t("vision.global.queenslandStatus"),
                  description: t("vision.global.queenslandDesc"),
                },
                {
                  name: t("vision.global.singapore"),
                  status: t("vision.global.singaporeStatus"),
                  description: t("vision.global.singaporeDesc"),
                },
                {
                  name: t("vision.global.hawaii"),
                  status: t("vision.global.hawaiiStatus"),
                  description: t("vision.global.hawaiiDesc"),
                },
                {
                  name: t("vision.global.europe"),
                  status: t("vision.global.europeStatus"),
                  description: t("vision.global.europeDesc"),
                },
                {
                  name: t("vision.global.usa"),
                  status: t("vision.global.usaStatus"),
                  description: t("vision.global.usaDesc"),
                },
              ]}
            />
          </div>
          <div className="flex flex-col gap-4">
            {MEDIA["vision-queensland"] && (
              <div className="overflow-hidden rounded-sm">
                <img
                  src={MEDIA["vision-queensland"].lightSrc}
                  alt={MEDIA["vision-queensland"].alt}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  className="h-auto w-full object-cover"
                  style={{ aspectRatio: "16 / 9" }}
                />
              </div>
            )}
            {MEDIA["vision-global"] && (
              <div className="overflow-hidden rounded-sm">
                <img
                  src={MEDIA["vision-global"].lightSrc}
                  alt={MEDIA["vision-global"].alt}
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
        <p className="mt-6 text-sm text-muted-foreground">
          {t("vision.global.operatingModel")}
        </p>
      </section>

      {/* Market Position */}
      <section className="py-10 border-t border-border" aria-labelledby="market-heading">
        <h2 id="market-heading" className="text-xl font-semibold text-foreground">
          {t("vision.market.heading")}
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border-l-2 border-secondary pl-4 py-1">
              <p className="text-sm text-foreground">{t(`vision.market.context${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
        <h3 className="mt-8 text-base font-semibold text-foreground">
          {t("vision.market.accessibility")}
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-border rounded-sm p-4">
              <p className="text-sm text-foreground">{t(`vision.market.access${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Production City */}
      <section className="py-10 border-t border-border" aria-labelledby="why-heading">
        <h2 id="why-heading" className="text-xl font-semibold text-foreground">
          {t("vision.why.heading")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="border-l-2 border-primary pl-4 py-2">
              <p className="text-sm text-foreground">{t(`vision.why.arg${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stakeholder Benefits */}
      <StakeholderGrid
        heading={t("vision.stakeholders.heading")}
        stakeholders={[
          {
            type: t("vision.stakeholders.creators"),
            description: t("vision.stakeholders.creatorsDesc"),
            benefits: [],
          },
          {
            type: t("vision.stakeholders.industry"),
            description: t("vision.stakeholders.industryDesc"),
            benefits: [],
          },
          {
            type: t("vision.stakeholders.investors"),
            description: t("vision.stakeholders.investorsDesc"),
            benefits: [],
          },
          {
            type: t("vision.stakeholders.governments"),
            description: t("vision.stakeholders.governmentsDesc"),
            benefits: [],
          },
        ]}
      />

      {/* The Team */}
      <section className="py-10 border-t border-border" aria-labelledby="team-heading">
        <h2 id="team-heading" className="text-xl font-semibold text-foreground">
          {t("vision.team.heading")}
        </h2>
        <div className="mt-4 border border-border rounded-sm p-6">
          <h3 className="text-base font-semibold text-foreground">
            {t("vision.team.leaderName")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("vision.team.leaderRole")}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("vision.team.leaderBio")}
          </p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("vision.team.teamDesc")}
        </p>
      </section>

      {/* Investor EOI */}
      <div id="eoi-section" className="border-t border-border">
        <EOISection
          heading={t("vision.eoi.heading")}
          contextText={t("vision.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory="investor"
          onSubmit={handleEoiSubmit}
        />
      </div>

      {/* Forward-Looking Disclaimer */}
      <ForwardLookingDisclaimer text={t("vision.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
