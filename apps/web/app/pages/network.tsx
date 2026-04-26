/**
 * Network page — global campus sequence.
 * Route: /network
 */

"use client";

import {
  LandingPageTemplate,
  GlobalCampusMap,
  ScrollRevealSection,
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

export function NetworkPage() {
  return (
    <I18nProvider>
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
      name: t("network.sydneyName"),
      status: t("network.sydneyStatus"),
      description: t("network.sydneyDesc"),
    },
    {
      name: t("network.switzerlandName"),
      status: t("network.switzerlandStatus"),
      description: t("network.switzerlandDesc"),
    },
    {
      name: t("network.singaporeName"),
      status: t("network.singaporeStatus"),
      description: t("network.singaporeDesc"),
    },
    {
      name: t("network.africaName"),
      status: t("network.africaStatus"),
      description: t("network.africaDesc"),
    },
    {
      name: t("network.usaName"),
      status: t("network.usaStatus"),
      description: t("network.usaDesc"),
    },
  ];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* Hero */}
      <section className="py-16 border-b border-border" aria-labelledby="page-heading">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
          {t("network.eyebrow")}
        </p>
        <h1 id="page-heading" className="text-3xl font-semibold text-foreground sm:text-4xl">
          {t("network.heading")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {t("network.lead")}
        </p>
      </section>

      {/* Campus map / location list */}
      <ScrollRevealSection delay={0}>
        <div className="py-6 border-b border-border">
          <GlobalCampusMap
            heading={t("network.mapLabel")}
            locations={locations}
          />
        </div>
      </ScrollRevealSection>

      {/* Why sequenced */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="sequence-heading">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <h2 id="sequence-heading" className="text-xl font-semibold text-foreground">
                {t("network.sequenceHeading")}
              </h2>
            </div>
            <p className="lg:col-span-8 text-sm text-muted-foreground leading-relaxed">
              {t("network.sequenceDesc")}
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
