/**
 * Company overview page.
 * Route: /company
 */

"use client";

import {
  LandingPageTemplate,
  ScrollRevealSection,
  ForwardLookingDisclaimer,
  EOISection,
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
import { CompanyStructuredData, DublinCoreMeta } from "../lib/structured-data";
import { MEDIA } from "../lib/media-config";


interface CompanyPageProps {
  serverLocale?: SupportedLocale;
}

export function CompanyPage({ serverLocale }: CompanyPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <CompanyPageContent />
    </I18nProvider>
  );
}

function CompanyPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const pillars = [
    { title: t("company.pillar1Title"), desc: t("company.pillar1Desc"), variant: "accent" as const },
    { title: t("company.pillar2Title"), desc: t("company.pillar2Desc"), variant: "ochre" as const },
    { title: t("company.pillar3Title"), desc: t("company.pillar3Desc"), variant: "default" as const },
    { title: t("company.pillar4Title"), desc: t("company.pillar4Desc"), variant: "default" as const },
    { title: t("company.pillar5Title"), desc: t("company.pillar5Desc"), variant: "default" as const },
  ];

  const partners = [
    { n: "i", title: t("company.partner1Title"), desc: t("company.partner1Desc") },
    { n: "ii", title: t("company.partner2Title"), desc: t("company.partner2Desc") },
    { n: "iii", title: t("company.partner3Title"), desc: t("company.partner3Desc") },
    { n: "iv", title: t("company.partner4Title"), desc: t("company.partner4Desc") },
  ];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <CompanyStructuredData />
      <DublinCoreMeta
        title="Company — Production City"
        description="About Production City: our operating model, strategy, and the team building Australia's integrated screen and stage campus."
        subject="company, about, production precinct, screen industry, Australia"
        path="/company"
        date="2026-04-27"
      />
      {/* Hero */}
      <section className="py-16 border-b border-border" aria-labelledby="page-heading">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
          {t("company.eyebrow")}
        </p>
        <h1 id="page-heading" className="text-3xl font-semibold text-foreground sm:text-4xl">
          {t("company.heading")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {t("company.lead")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/facilities"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("company.ctaFacilities")} →
          </a>
        </div>
      </section>

      {/* What we do */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="what-heading">
          <div className="mb-8">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              {t("company.whatLabel")}
            </p>
            <h2 id="what-heading" className="mt-2 text-xl font-semibold text-foreground">
              {t("company.whatHeading")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {(["what1", "what2", "what3"] as const).map((key, i) => (
              <p
                key={key}
                className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-5"
                style={{ counterIncrement: "threep" }}
              >
                <span className="block text-xs font-mono text-primary mb-2">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {t(`company.${key}` as Parameters<typeof t>[0])}
              </p>
            ))}
          </div>
        </section>
      </ScrollRevealSection>

      {/* Five pillars */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="pillars-heading">
          <div className="mb-8">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              {t("company.pillarsLabel")}
            </p>
            <h2 id="pillars-heading" className="mt-2 text-xl font-semibold text-foreground">
              {t("company.pillarsHeading")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-5 border border-border">
            {pillars.map(({ title, desc, variant }, i) => {
              const romanNumerals = ["i", "ii", "iii", "iv", "v"] as const;
              return (
                <div
                  key={title}
                  className="bg-background p-6 flex flex-col gap-4 min-h-[240px]"
                >
                  <span
                    className="text-4xl font-light"
                    style={{
                      fontFamily: "var(--font-serif, serif)",
                      color: variant === "accent"
                        ? "var(--color-primary)"
                        : variant === "ochre"
                        ? "var(--ochre, oklch(0.72 0.15 60))"
                        : "var(--color-muted-foreground)",
                    }}
                  >
                    {romanNumerals[i]}
                  </span>
                  <h3
                    className="text-sm font-semibold"
                    style={{
                      color: variant === "ochre"
                        ? "var(--ochre, oklch(0.72 0.15 60))"
                        : "var(--color-foreground)",
                    }}
                  >
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </ScrollRevealSection>

      {/* Leadership teaser */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="leadership-heading">
          <div className="mb-8">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              {t("company.leadershipLabel")}
            </p>
            <h2 id="leadership-heading" className="mt-2 text-xl font-semibold text-foreground">
              {t("company.leadershipHeading")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Troy Kelly */}
            <div className="flex flex-col gap-4 border border-border p-0">
              <div
                className="aspect-[4/5] border-0 flex flex-col justify-between p-4 text-xs font-mono tracking-widest text-muted-foreground"
                role="img"
                aria-label={t("companyTeam.troyPortraitAriaLabel")}
              >
                <div className="flex justify-between"><span>{t("companyTeam.troyPortraitLabel")}</span><span>{t("companyTeam.roleCeo")}</span></div>
                <span className="text-center">{t("companyTeam.portraitPlaceholder")}</span>
                <div className="flex justify-between"><span>{t("companyTeam.roleFounder")}</span><span>{t("companyTeam.roleChiefExecutive")}</span></div>
              </div>
              <div className="p-4 pb-5">
                <p className="text-base font-semibold text-foreground">{t("companyTeam.troyName")}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t("company.leadershipBio1")}
                </p>
              </div>
            </div>

            {/* Matthew Compton */}
            <div className="flex flex-col gap-4 border border-border p-0">
              <div
                className="aspect-[4/5] overflow-hidden"
                style={{ borderLeft: "3px solid var(--ochre, oklch(0.72 0.15 60))" }}
              >
                <img
                  src={MEDIA["team-matthew-compton"]?.darkSrc ?? "/media/team-matthew-compton/dark.jpg"}
                  alt={t("companyTeam.matthewPortraitAlt")}
                  width={900}
                  height={1200}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 pb-5">
                <p className="text-base font-semibold text-foreground">
                  {t("companyTeam.matthewName")}{" "}
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--ochre, oklch(0.72 0.15 60))" }}
                  >
                    {t("companyTeam.matthewNation")}
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t("company.leadershipBio2")}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {t("company.leadershipNote")}
          </p>
        </section>
      </ScrollRevealSection>

      {/* Partners */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="partners-heading">
          <div className="mb-8">
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              {t("company.partnersLabel")}
            </p>
            <h2 id="partners-heading" className="mt-2 text-xl font-semibold text-foreground">
              {t("company.partnersHeading")}
            </h2>
          </div>
          <p className="mb-8 text-sm text-muted-foreground max-w-2xl leading-relaxed" style={{ fontFamily: "var(--font-serif, serif)" }}>
            {t("company.partnersIntro")}
          </p>
          <div className="flex flex-col divide-y divide-border">
            {partners.map(({ n, title, desc }) => (
              <div key={n} className="py-8 grid grid-cols-1 gap-4 sm:grid-cols-[4rem_1fr_2fr] sm:items-baseline">
                <span className="text-xs font-mono tracking-widest text-primary uppercase">{n}</span>
                <h3 className="text-base font-medium text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            {t("company.partnersNote")}
          </p>
        </section>
      </ScrollRevealSection>

      {/* Pull quote */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="pull-quote-heading">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-2">
              <h2 id="pull-quote-heading" className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                {t("company.pullQuoteLabel")}
              </h2>
            </div>
            <blockquote className="lg:col-span-9 text-lg text-foreground leading-relaxed" style={{ fontFamily: "var(--font-serif, serif)" }}>
              {t("company.pullQuote")}
            </blockquote>
          </div>
        </section>
      </ScrollRevealSection>

      {/* CTA */}
      <section className="py-12 border-b border-primary text-center" aria-labelledby="company-cta-heading">
        <p className="text-xs font-mono tracking-widest text-primary uppercase mb-4">{t("common.next")}</p>
        <h2 id="company-cta-heading" className="text-xl font-semibold text-foreground mb-6">
          {t("company.cta")}
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("company.ctaLink")} →
          </a>
        </div>
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

      <ForwardLookingDisclaimer text={t("company.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
