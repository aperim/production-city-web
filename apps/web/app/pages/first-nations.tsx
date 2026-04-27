/**
 * First Nations approach page.
 * Route: /first-nations
 *
 * Uses ochre accent theming consistent with the reference design.
 */

"use client";

import {
  LandingPageTemplate,
  MediaHero,
  ScrollRevealSection,
  ForwardLookingDisclaimer,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import type { SupportedLocale } from "../i18n/index.js";
import {
  useLandingNav,
  useLandingFooter,
} from "../lib/use-landing-layout";
import { MEDIA } from "../lib/media-config";
import { SimpleWebPageStructuredData, DublinCoreMeta } from "../lib/structured-data";


interface FirstNationsPageProps {
  serverLocale?: SupportedLocale;
}

export function FirstNationsPage({ serverLocale }: FirstNationsPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <FirstNationsPageContent />
    </I18nProvider>
  );
}

function FirstNationsPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();

  const ipPrinciples = [
    t("firstNations.ip1"),
    t("firstNations.ip2"),
    t("firstNations.ip3"),
    t("firstNations.ip4"),
  ];

  const onCountryBullets = [
    t("firstNations.onCountry1"),
    t("firstNations.onCountry2"),
    t("firstNations.onCountry3"),
    t("firstNations.onCountry4"),
  ];

  const evidenceItems = [
    t("firstNations.evidence1"),
    t("firstNations.evidence2"),
    t("firstNations.evidence3"),
    t("firstNations.evidence4"),
    t("firstNations.evidence5"),
  ];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <SimpleWebPageStructuredData
        name="First Nations — Production City"
        description="Production City's approach to First Nations engagement: respectful partnerships, on-Country protocols, and meaningful participation in screen and stage production."
        path="/first-nations"
      />
      <DublinCoreMeta
        title="First Nations — Production City"
        description="Production City's approach to First Nations engagement: respectful partnerships, on-Country protocols, and meaningful participation in screen and stage production."
        subject="First Nations, Indigenous, Aboriginal, Torres Strait Islander, screen production, Queensland"
        path="/first-nations"
        date="2026-04-27"
      />
      {/* Hero — Australian country landscape, ochre accent */}
      {MEDIA["first-nations-hero"] && (
        <MediaHero
          lightSrc={MEDIA["first-nations-hero"].lightSrc}
          darkSrc={MEDIA["first-nations-hero"].darkSrc}
          alt={MEDIA["first-nations-hero"].alt}
          width={MEDIA["first-nations-hero"].width}
          height={500}
          averageColor={MEDIA["first-nations-hero"].averageColor}
          photographer={MEDIA["first-nations-hero"].photographer}
          photographerUrl={MEDIA["first-nations-hero"].photographerUrl}
          source={MEDIA["first-nations-hero"].source}
          sourceUrl={MEDIA["first-nations-hero"].sourceUrl}
        >
          <div className="pb-8">
            <p
              className="text-xs font-mono tracking-widest uppercase mb-4"
              style={{ color: "oklch(0.82 0.15 60)" }}
            >
              {t("firstNations.eyebrow")}
            </p>
            <h1 id="page-heading" className="text-3xl font-semibold text-white sm:text-4xl">
              {t("firstNations.heading")}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/80">
              {t("firstNations.lead")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* Acknowledgement of Country */}
      <ScrollRevealSection delay={0}>
        <section className="py-14 border-b border-border bg-background" aria-labelledby="ack-heading">
          <h2
            id="ack-heading"
            className="text-xs font-mono tracking-widest text-center uppercase mb-10"
            style={{ color: "var(--ochre, oklch(0.72 0.15 60))" }}
          >
            {t("firstNations.ackLabel")}
          </h2>
          <blockquote
            className="mx-auto max-w-3xl text-xl leading-relaxed text-foreground pl-6"
            style={{
              fontFamily: "var(--font-serif, serif)",
              borderLeft: "3px solid var(--ochre, oklch(0.72 0.15 60))",
            }}
          >
            {t("firstNations.ackQuote")}
          </blockquote>
        </section>
      </ScrollRevealSection>

      {/* Leadership */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="fn-leadership-heading">
          <div className="mb-8 border-t-2 pt-4" style={{ borderColor: "var(--ochre, oklch(0.72 0.15 60))" }}>
            <p
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: "var(--ochre, oklch(0.72 0.15 60))" }}
            >
              {t("firstNations.leadershipLabel")}
            </p>
            <h2 id="fn-leadership-heading" className="mt-2 text-xl font-semibold text-foreground">
              {t("firstNations.leadershipHeading")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div
                className="aspect-[3/4] overflow-hidden border"
                style={{ borderColor: "var(--ochre, oklch(0.72 0.15 60))" }}
              >
                <img
                  src={MEDIA["team-matthew-compton"]?.darkSrc ?? "/media/team-matthew-compton/dark.jpg"}
                  alt="Portrait of Matthew Compton, Executive Director and COO of Production City, a Wiradjuri man"
                  width={900}
                  height={1200}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-3">
              <p className="text-sm text-muted-foreground leading-relaxed">{t("firstNations.leadershipBio1")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("firstNations.leadershipBio2")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t("firstNations.leadershipBio3")}</p>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* IP & Data provenance */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="ip-heading">
          <div className="mb-8 border-t-2 pt-4" style={{ borderColor: "var(--ochre, oklch(0.72 0.15 60))" }}>
            <p
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: "var(--ochre, oklch(0.72 0.15 60))" }}
            >
              {t("firstNations.ipLabel")}
            </p>
            <h2 id="ip-heading" className="mt-2 text-xl font-semibold text-foreground">
              {t("firstNations.ipHeading")}
            </h2>
          </div>
          <ul className="flex flex-col divide-y divide-border max-w-3xl">
            {ipPrinciples.map((principle, i) => (
              <li key={i} className="py-5 grid grid-cols-[2rem_1fr] gap-6 items-baseline">
                <span
                  className="text-xs font-mono tracking-widest"
                  style={{ color: "var(--ochre, oklch(0.72 0.15 60))" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: "var(--font-serif, serif)" }}>
                  {principle}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </ScrollRevealSection>

      {/* On Country */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="on-country-heading">
          <div className="mb-8 border-t-2 pt-4" style={{ borderColor: "var(--ochre, oklch(0.72 0.15 60))" }}>
            <p
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: "var(--ochre, oklch(0.72 0.15 60))" }}
            >
              {t("firstNations.onCountryLabel")}
            </p>
            <h2 id="on-country-heading" className="mt-2 text-xl font-semibold text-foreground">
              {t("firstNations.onCountryHeading")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <p
              className="lg:col-span-7 text-lg text-foreground leading-relaxed"
              style={{ fontFamily: "var(--font-serif, serif)" }}
            >
              {t("firstNations.onCountryDesc")}
            </p>
            <ul className="lg:col-span-4 flex flex-col divide-y divide-border">
              {onCountryBullets.map((bullet, i) => (
                <li key={i} className="py-4 text-sm text-muted-foreground leading-relaxed">
                  — {bullet}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </ScrollRevealSection>

      {/* Creative work */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="creative-heading">
          <div className="mb-8 border-t-2 pt-4" style={{ borderColor: "var(--ochre, oklch(0.72 0.15 60))" }}>
            <p
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: "var(--ochre, oklch(0.72 0.15 60))" }}
            >
              {t("firstNations.creativeLabel")}
            </p>
            <h2 id="creative-heading" className="mt-2 text-xl font-semibold text-foreground">
              {t("firstNations.creativeHeading")}
            </h2>
          </div>
          <p
            className="max-w-2xl text-lg text-foreground leading-relaxed"
            style={{ fontFamily: "var(--font-serif, serif)" }}
          >
            {t("firstNations.creativeDesc")}
          </p>
        </section>
      </ScrollRevealSection>

      {/* Evidence */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="evidence-heading">
          <div className="mb-8 border-t-2 pt-4" style={{ borderColor: "var(--ochre, oklch(0.72 0.15 60))" }}>
            <p
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: "var(--ochre, oklch(0.72 0.15 60))" }}
            >
              {t("firstNations.evidenceLabel")}
            </p>
            <h2 id="evidence-heading" className="mt-2 text-xl font-semibold text-foreground">
              {t("firstNations.evidenceHeading")}
            </h2>
          </div>
          <ul className="flex flex-col divide-y divide-border max-w-3xl">
            {evidenceItems.map((item, i) => (
              <li key={i} className="py-4 text-sm text-muted-foreground font-mono tracking-wide leading-relaxed">
                → {item}
              </li>
            ))}
          </ul>
        </section>
      </ScrollRevealSection>

      {/* CTA */}
      <section
        className="py-12 border-b text-center"
        style={{ borderColor: "var(--ochre, oklch(0.72 0.15 60))" }}
        aria-labelledby="fn-cta-heading"
      >
        <p
          className="text-xs font-mono tracking-widest uppercase mb-4"
          style={{ color: "var(--ochre, oklch(0.72 0.15 60))" }}
        >
          {t("common.next")}
        </p>
        <h2 id="fn-cta-heading" className="text-xl font-semibold text-foreground mb-6">
          {t("firstNations.ctaHeading")}
        </h2>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm border hover:bg-muted transition-colors"
          style={{ borderColor: "var(--ochre, oklch(0.72 0.15 60))", color: "var(--foreground)" }}
        >
          {t("firstNations.ctaLink")} →
        </a>
      </section>

      <ForwardLookingDisclaimer text={t("facilities.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
