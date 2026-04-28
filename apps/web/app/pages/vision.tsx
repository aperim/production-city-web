/**
 * Vision & Global Network page — global vision, market position, stakeholders.
 * Hero with media, statement block, Australia + Global sections,
 * GlobalCampusMap, StakeholderGrid, split CTAs, forward-looking disclaimer.
 * All text from i18n.
 */

"use client";

import {
  LandingPageTemplate,
  MediaHero,
  GlobalCampusMap,
  StakeholderGrid,
  ForwardLookingDisclaimer,
  EOISection,
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
import { SimpleWebPageStructuredData, DublinCoreMeta } from "../lib/structured-data";


interface VisionPageProps {
  serverLocale?: SupportedLocale;
}

export function VisionPage({ serverLocale }: VisionPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
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
      <SimpleWebPageStructuredData
        name="Vision & Global Network — Production City"
        description="Production City's global vision: an Australia-anchored screen and stage campus networked with international co-production hubs and creative ecosystems."
        path="/vision"
      />
      <DublinCoreMeta
        title="Vision & Global Network — Production City"
        description="Production City's global vision: an Australia-anchored screen and stage campus networked with international co-production hubs and creative ecosystems."
        subject="vision, global network, co-production, screen industry, Australia"
        path="/vision"
        date="2026-04-27"
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
              {t("vision.mission.heading")}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-white/90">
              {t("vision.mission.vision")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* The Vision — StatementBlock */}
      <ScrollRevealSection delay={0}>
      <section className="py-12" aria-labelledby="vision-statement-heading">
        <h2 id="vision-statement-heading" className="sr-only">
          {t("vision.mission.themes")}
        </h2>
        <p className="text-lg font-semibold text-foreground max-w-3xl">
          {t("vision.mission.vision")}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <div key={n} className="border-l-2 border-primary pl-4 py-1">
              <p className="text-sm text-foreground">{t(`vision.mission.theme${n}` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>
      </ScrollRevealSection>

      {/* Australia First — with media */}
      <ScrollRevealSection delay={100}>
      <section className="py-10 border-t border-border" aria-labelledby="australia-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          {MEDIA["vision-australia"] && (
            <div className="overflow-hidden rounded-sm">
              <img
                src={MEDIA["vision-australia"].lightSrc}
                alt={MEDIA["vision-australia"].alt}
                width={1920}
                height={1080}
                loading="lazy"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "16 / 9" }}
              />
            </div>
          )}
          <div>
            <h2 id="australia-heading" className="text-xl font-semibold text-foreground">
              {t("vision.global.australia")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("vision.global.australiaStatus")}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("vision.global.australiaDesc")}
            </p>
          </div>
        </div>
      </section>
      </ScrollRevealSection>

      {/* Global Expansion — with media */}
      <ScrollRevealSection delay={100}>
      <section className="py-10 border-t border-border" aria-labelledby="global-expansion-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          <div className="order-2 lg:order-1">
            <h2 id="global-expansion-heading" className="text-xl font-semibold text-foreground">
              {t("vision.global.heading")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("vision.global.operatingModel")}
            </p>
          </div>
          {MEDIA["vision-global"] && (
            <div className="order-1 overflow-hidden rounded-sm lg:order-2">
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
      </section>
      </ScrollRevealSection>

      {/* Global Campus Map */}
      <ScrollRevealSection delay={200}>
      <section className="py-10 border-t border-border" aria-labelledby="global-heading">
        <GlobalCampusMap
          heading={t("vision.global.heading")}
          locations={[
            {
              name: t("vision.global.australia"),
              status: t("vision.global.australiaStatus"),
              description: t("vision.global.australiaDesc"),
            },
            {
              name: t("vision.global.asiaPacific"),
              status: t("vision.global.asiaPacificStatus"),
              description: t("vision.global.asiaPacificDesc"),
            },
            {
              name: t("vision.global.northAmerica"),
              status: t("vision.global.northAmericaStatus"),
              description: t("vision.global.northAmericaDesc"),
            },
            {
              name: t("vision.global.europe"),
              status: t("vision.global.europeStatus"),
              description: t("vision.global.europeDesc"),
            },
          ]}
        />
      </section>
      </ScrollRevealSection>

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
