/**
 * Network page — global campus sequence.
 * Route: /network
 */

"use client";

import {
  LandingPageTemplate,
  GlobalCampusMap,
  MediaHero,
  ScrollRevealSection,
  ForwardLookingDisclaimer,
  EOISection,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import type { SupportedLocale } from "../i18n/index.js";
import { MEDIA } from "../lib/media-config";
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";
import { SimpleWebPageStructuredData, DublinCoreMeta } from "../lib/structured-data";


interface NetworkPageProps {
  serverLocale?: SupportedLocale;
}

export function NetworkPage({ serverLocale }: NetworkPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <NetworkPageContent />
    </I18nProvider>
  );
}

function NetworkPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const locations = [
    {
      name: t("network.australiaName"),
      status: t("network.australiaStatus"),
      description: t("network.australiaDesc"),
    },
    {
      name: t("network.europeName"),
      status: t("network.europeStatus"),
      description: t("network.europeDesc"),
    },
    {
      name: t("network.asiaPacificName"),
      status: t("network.asiaPacificStatus"),
      description: t("network.asiaPacificDesc"),
    },
    {
      name: t("network.africaName"),
      status: t("network.africaStatus"),
      description: t("network.africaDesc"),
    },
    {
      name: t("network.northAmericaName"),
      status: t("network.northAmericaStatus"),
      description: t("network.northAmericaDesc"),
    },
  ];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <SimpleWebPageStructuredData
        name="Global Network — Production City"
        description="Production City's global network: an integrated screen and stage campus in Queensland connected to international co-production partners and creative hubs."
        path="/network"
      />
      <DublinCoreMeta
        title="Global Network — Production City"
        description="Production City's global network: an integrated screen and stage campus in Queensland connected to international co-production partners and creative hubs."
        subject="global network, co-production, international, screen industry, Queensland, Australia"
        path="/network"
        date="2026-04-27"
      />
      {/* Hero */}
      {MEDIA["network-hero"] && (
        <MediaHero
          lightSrc={MEDIA["network-hero"].lightSrc}
          darkSrc={MEDIA["network-hero"].darkSrc}
          alt={MEDIA["network-hero"].alt}
          width={MEDIA["network-hero"].width}
          height={500}
          averageColor={MEDIA["network-hero"].averageColor}
          photographer={MEDIA["network-hero"].photographer}
          photographerUrl={MEDIA["network-hero"].photographerUrl}
          source={MEDIA["network-hero"].source}
          sourceUrl={MEDIA["network-hero"].sourceUrl}
        >
          <div className="pb-8">
            <p className="text-xs font-mono tracking-widest text-white/60 uppercase mb-4">
              {t("network.eyebrow")}
            </p>
            <h1 id="page-heading" className="text-3xl font-semibold text-white sm:text-4xl">
              {t("network.heading")}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/80">
              {t("network.lead")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* Campus map / location list */}
      <ScrollRevealSection delay={0}>
        <div className="py-6 border-b border-border">
          <GlobalCampusMap
            heading={t("network.mapLabel")}
            locations={locations}
          />
        </div>
      </ScrollRevealSection>

      {/* Approach */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="approach-heading">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <h2 id="approach-heading" className="text-xl font-semibold text-foreground">
                {t("network.approachHeading")}
              </h2>
            </div>
            <p className="lg:col-span-8 text-sm text-muted-foreground leading-relaxed">
              {t("network.approachDesc")}
            </p>
          </div>
        </section>
      </ScrollRevealSection>

      {/* One operator */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="operator-heading">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <h2 id="operator-heading" className="text-xl font-semibold text-foreground">
                {t("network.operatorHeading")}
              </h2>
            </div>
            <p className="lg:col-span-8 text-sm text-muted-foreground leading-relaxed">
              {t("network.operatorDesc")}
            </p>
          </div>
        </section>
      </ScrollRevealSection>

      {/* CTA */}
      <section className="py-12 border-b border-border text-center" aria-labelledby="network-cta-heading">
        <h2 id="network-cta-heading" className="text-xl font-semibold text-foreground mb-6">
          {t("network.cta")}
        </h2>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 border border-border px-6 py-3 text-sm text-foreground hover:bg-muted transition-colors"
        >
          {t("network.ctaLink")} →
        </a>
      </section>

      {/* EOI */}
      <div id="eoi-section" className="border-t border-border">
        <EOISection
          heading={t("facilities.eoi.heading")}
          contextText={t("facilities.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory="investor"
          onSubmit={handleEoiSubmit}
        />
      </div>

      <ForwardLookingDisclaimer text={t("facilities.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
