/**
 * Home page — Production City editorial landing.
 * Matches reference/index.html design: hero, operating model,
 * facilities preview, services, First Nations, pull quote,
 * network sequence, audience routing, chorus, acknowledgement, EOI.
 *
 * All copy is routed through t() (#344).
 */

"use client";

import {
  LandingPageTemplate,
  EOISection,
  GlobeHero,
  ScrollRevealSection,
  SignalDiagram,
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
import { HomeStructuredData, DublinCoreMeta } from "../lib/structured-data";

interface HomePageProps {
  serverLocale?: SupportedLocale;
}

export function HomePage({ serverLocale }: HomePageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
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

  const globeLabels = {
    "australia-sydney": t("globe.label.australia"),
    "asia-pacific-singapore": t("globe.label.asiaPacific"),
    "europe-switzerland": t("globe.label.europe"),
    "africa-cape-town": t("globe.label.africa"),
    "north-america-toronto": t("globe.label.northAmerica"),
    "north-america-los-angeles": t("globe.label.northAmerica"),
    oceania: t("globe.label.oceania"),
  };
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const pillars = [
    { num: "i", title: t("home.operatingModel.pillars.realtime.title"), text: t("home.operatingModel.pillars.realtime.text") },
    { num: "ii", title: t("home.operatingModel.pillars.oneOperator.title"), text: t("home.operatingModel.pillars.oneOperator.text") },
    { num: "iii", title: t("home.operatingModel.pillars.sharedPipeline.title"), text: t("home.operatingModel.pillars.sharedPipeline.text") },
    { num: "iv", title: t("home.operatingModel.pillars.closedLoop.title"), text: t("home.operatingModel.pillars.closedLoop.text") },
  ];

  const stats = [
    { value: "1", label: t("home.operatingModel.stats.operator") },
    { value: "2", label: t("home.operatingModel.stats.lanes") },
    { value: "19", label: t("home.operatingModel.stats.stations") },
    { value: "1", unit: " loop", label: t("home.operatingModel.stats.loop") },
  ];

  const audiences = [
    { num: "I", title: t("home.audience.cards.producers.title"), text: t("home.audience.cards.producers.text"), href: `${prefix}/contact?category=producer` },
    { num: "II", title: t("home.audience.cards.government.title"), text: t("home.audience.cards.government.text"), href: `${prefix}/contact?category=government` },
    { num: "III", title: t("home.audience.cards.investors.title"), text: t("home.audience.cards.investors.text"), href: `${prefix}/contact?category=investor` },
    { num: "IV", title: t("home.audience.cards.techPartners.title"), text: t("home.audience.cards.techPartners.text"), href: `${prefix}/contact?category=partner` },
  ];

  return (
    <LandingPageTemplate nav={{ ...nav, transparent: true }} footer={footer}>
      <HomeStructuredData />
      <DublinCoreMeta
        title="Production City — Integrated Screen & Stage Campus"
        description="Australia's first purpose-built integrated screen and stage production campus, combining sound stages, broadcast theatre, studio offices, and shared infrastructure."
        subject="film studio, screen production, stage production, Australia, integrated campus"
        path="/"
        date="2026-04-27"
      />
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative flex min-h-dvh flex-col justify-end bg-(--pc-color-neutral-950) px-(--pc-spacing-6) pb-12 text-(--pc-color-neutral-100)" aria-labelledby="hero-heading">
        {/* Globe hero background */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <GlobeHero labels={globeLabels} className="h-full w-full" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.12) 100%)",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-[1720px]">
          <div className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-400)">
            <span className="inline-block h-2 w-2 rounded-full bg-(--pc-color-secondary-500)" aria-hidden="true" />
            <span>Production City™</span>
            <span style={{ opacity: 0.4 }}>—</span>
            <span>{t("home.hero.locations")}</span>
          </div>

          <h1 id="hero-heading" className="m-0 font-serif text-[clamp(56px,9vw,168px)] font-normal leading-[0.95] tracking-[-0.02em]">
            {t("home.hero.heading")}
          </h1>

          <p className="mt-6 max-w-[42ch] text-[clamp(19px,1.6vw,24px)] leading-[1.45] text-(--pc-color-neutral-300)">
            {t("home.hero.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={`${prefix}/facilities`}
              className="inline-flex items-center gap-2 border border-(--pc-color-neutral-100) px-6 py-3 font-sans text-sm font-medium text-(--pc-color-neutral-100) no-underline transition-opacity duration-200 hover:opacity-65"
            >
              {t("home.hero.ctaFacilities")} <span aria-hidden="true">→</span>
            </a>
            <a
              href="#eoi-section"
              className="inline-flex items-center gap-2 border border-(--pc-color-neutral-400) px-6 py-3 font-sans text-sm font-medium text-(--pc-color-neutral-300) no-underline transition-opacity duration-200 hover:opacity-65"
            >
              {t("home.hero.ctaEoi")} <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-12 flex w-full max-w-[1720px] items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
          <span>{t("home.hero.homeLabel")}</span>
          <span>{t("home.hero.scrollIndicator")}</span>
        </div>
      </section>

      {/* ═══════════ SECTION 1 — OPERATING MODEL ═══════════ */}
      <ScrollRevealSection delay={0}>
        <section className="bg-(--pc-color-neutral-900) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-100)" aria-labelledby="operating-model-heading">
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-12 border-t border-(--pc-color-neutral-800) pt-8">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-400)">
                {t("home.operatingModel.sectionLabel")}
              </div>
              <h2 id="operating-model-heading" className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                {t("home.operatingModel.heading")}
              </h2>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              {/* Left column — text + pillars + stats */}
              <div className="flex flex-col gap-14 lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
                <div className="text-lg leading-relaxed">
                  <p className="max-w-[64ch]">
                    {t("home.operatingModel.body1")}
                  </p>
                  <p className="mt-4 max-w-[64ch]">
                    {t("home.operatingModel.body2")}
                  </p>
                </div>

                {/* Operating pillars */}
                <div className="flex flex-col gap-8">
                  {pillars.map((p) => (
                    <div key={p.num} className="flex gap-4">
                      <span className="flex-none font-serif text-2xl text-(--pc-color-neutral-400)">{p.num}</span>
                      <div>
                        <h3 className="m-0 text-base font-medium text-(--pc-color-neutral-100)">{p.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-(--pc-color-neutral-400)">{p.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stat strip */}
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <div className="font-serif text-[clamp(40px,5vw,64px)] font-normal leading-[0.85] tracking-[-0.03em] text-(--pc-color-neutral-100)">
                        {s.value}
                        {"unit" in s && (
                          <span className="text-[0.4em] tracking-normal text-(--pc-color-neutral-400)">{s.unit}</span>
                        )}
                      </div>
                      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column — IP lifecycle */}
              <div className="lg:col-start-7 lg:col-span-6">
                <SignalDiagram />
              </div>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ SECTION 2 — FACILITIES PREVIEW ═══════════ */}
      <ScrollRevealSection delay={100}>
        <section className="bg-(--pc-color-neutral-950) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-100)" aria-labelledby="facilities-preview-heading">
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-12 border-t border-(--pc-color-neutral-800) pt-8">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-400)">
                {t("home.facilitiesSection.sectionLabel")}
              </div>
              <h2 id="facilities-preview-heading" className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                {t("home.facilitiesSection.heading")}
              </h2>
            </div>

            {/* Tile grid — 2-column, first tile spans 2 rows */}
            <div className="grid grid-cols-1 gap-[clamp(16px,2vw,32px)] md:grid-cols-[1.1fr_0.9fr]">
              {/* Screen stages — tall, spans 2 rows */}
              <a
                href={`${prefix}/facilities#screen-stages`}
                className="group flex min-h-[520px] flex-col justify-between border border-(--pc-color-neutral-800) no-underline transition-colors duration-200 hover:border-(--pc-color-neutral-600) md:row-span-2"
              >
                {MEDIA["facilities-screen-stage"] && (
                  <div className="overflow-hidden">
                    <img
                      src={MEDIA["facilities-screen-stage"].lightSrc}
                      alt={MEDIA["facilities-screen-stage"].alt}
                      width={1920}
                      height={1080}
                      loading="lazy"
                      className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      style={{ aspectRatio: "16/9" }}
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                      {t("home.facilitiesSection.tiles.screenStages.label")}
                    </div>
                    <h3 className="mt-4 font-serif text-[clamp(22px,3vw,44px)] font-normal leading-[1.15]">
                      {t("home.facilitiesSection.tiles.screenStages.heading")}
                    </h3>
                  </div>
                  <div>
                    <div className="whitespace-pre-line font-mono text-xs leading-relaxed text-(--pc-color-neutral-400)">
                      {t("home.facilitiesSection.tiles.screenStages.specs")}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-(--pc-color-neutral-300)">
                      {t("home.facilitiesSection.tiles.screenStages.linkLabel")} <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </a>

              {/* Commercial stages */}
              <a
                href={`${prefix}/facilities#commercial-stages`}
                className="group flex flex-col justify-between border border-(--pc-color-neutral-800) no-underline transition-colors duration-200 hover:border-(--pc-color-neutral-600)"
              >
                {MEDIA["facilities-commercial-stage"] && (
                  <div className="overflow-hidden">
                    <img
                      src={MEDIA["facilities-commercial-stage"].lightSrc}
                      alt={MEDIA["facilities-commercial-stage"].alt}
                      width={1920}
                      height={1080}
                      loading="lazy"
                      className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      style={{ aspectRatio: "16/9" }}
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                      {t("home.facilitiesSection.tiles.commercialStages.label")}
                    </div>
                    <h3 className="mt-3 font-serif text-[clamp(18px,2vw,30px)] font-normal leading-[1.15]">
                      {t("home.facilitiesSection.tiles.commercialStages.heading")}
                    </h3>
                  </div>
                  <div>
                    <div className="mt-4 whitespace-pre-line font-mono text-xs leading-relaxed text-(--pc-color-neutral-400)">
                      {t("home.facilitiesSection.tiles.commercialStages.specs")}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-(--pc-color-neutral-300)">
                      {t("home.facilitiesSection.tiles.commercialStages.linkLabel")} <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </a>

              {/* Broadcast theatre */}
              <a
                href={`${prefix}/facilities#broadcast-theatre`}
                className="group flex flex-col justify-between border border-(--pc-color-neutral-800) no-underline transition-colors duration-200 hover:border-(--pc-color-neutral-600)"
              >
                {MEDIA["facilities-broadcast-theatre"] && (
                  <div className="overflow-hidden">
                    <img
                      src={MEDIA["facilities-broadcast-theatre"].lightSrc}
                      alt={MEDIA["facilities-broadcast-theatre"].alt}
                      width={1920}
                      height={1080}
                      loading="lazy"
                      className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      style={{ aspectRatio: "16/9" }}
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                      {t("home.facilitiesSection.tiles.broadcastTheatre.label")}
                    </div>
                    <h3 className="mt-3 font-serif text-[clamp(18px,2vw,30px)] font-normal leading-[1.15]">
                      {t("home.facilitiesSection.tiles.broadcastTheatre.heading")}
                    </h3>
                  </div>
                  <div>
                    <div className="mt-4 whitespace-pre-line font-mono text-xs leading-relaxed text-(--pc-color-neutral-400)">
                      {t("home.facilitiesSection.tiles.broadcastTheatre.specs")}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-(--pc-color-neutral-300)">
                      {t("home.facilitiesSection.tiles.broadcastTheatre.linkLabel")} <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </a>
            </div>

            {/* Control room — full width */}
            <a
              href={`${prefix}/facilities#control-room`}
              className="mt-[clamp(16px,2vw,32px)] grid grid-cols-1 gap-[clamp(24px,3vw,56px)] border border-(--pc-color-neutral-800) p-6 no-underline transition-colors duration-200 hover:border-(--pc-color-neutral-600) md:grid-cols-2"
            >
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                  {t("home.facilitiesSection.controlRoom.label")}
                </div>
                <h3 className="mt-3 font-serif text-[clamp(28px,3vw,44px)] font-normal leading-[1.15]">
                  {t("home.facilitiesSection.controlRoom.heading")}
                </h3>
                <p className="mt-3 max-w-[48ch] text-(--pc-color-neutral-400)">
                  {t("home.facilitiesSection.controlRoom.prose")}
                </p>
              </div>
              <div className="self-end text-right">
                <div className="whitespace-pre-line font-mono text-xs leading-relaxed text-(--pc-color-neutral-400)">
                  {t("home.facilitiesSection.controlRoom.specs")}
                </div>
                <div className="mt-6 flex items-center justify-end gap-2 text-sm text-(--pc-color-neutral-300)">
                  {t("home.facilitiesSection.controlRoom.linkLabel")} <span aria-hidden="true">→</span>
                </div>
              </div>
            </a>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ MASTERPLAN TEASER ═══════════ */}
      <ScrollRevealSection delay={0}>
        <section className="bg-(--pc-color-neutral-900) px-(--pc-spacing-6) py-[clamp(48px,7vw,96px)] text-(--pc-color-neutral-100)" aria-labelledby="masterplan-teaser-heading">
          <div className="mx-auto max-w-[1720px]">
            <div className="grid grid-cols-1 items-center gap-[clamp(32px,4vw,64px)] lg:grid-cols-2">
              {/* Left — text + CTA */}
              <div>
                <div className="mb-4 border-t border-(--pc-color-neutral-800) pt-8">
                  <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-400)">
                    {t("home.masterplanTeaser.eyebrow")}
                  </div>
                  <h2 id="masterplan-teaser-heading" className="m-0 font-serif text-[clamp(28px,3.5vw,48px)] font-normal leading-[1.1] tracking-[-0.01em]">
                    {t("home.masterplanTeaser.heading")}
                  </h2>
                  <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-(--pc-color-neutral-400)">
                    {t("home.masterplanTeaser.body")}
                  </p>
                </div>
                <a
                  href={`${prefix}/masterplan`}
                  onMouseEnter={() => { void import("@productioncity/holding-ui"); }}
                  className="mt-8 inline-flex items-center gap-2 border border-(--pc-color-neutral-100) px-6 py-3 font-sans text-sm font-medium text-(--pc-color-neutral-100) no-underline transition-opacity duration-200 hover:opacity-65"
                >
                  {t("home.masterplanTeaser.ctaLabel")}
                </a>
              </div>

              {/* Right — poster image placeholder */}
              {MEDIA["masterplan-poster"] ? (
                <div className="overflow-hidden border border-(--pc-color-neutral-800)">
                  <img
                    src={MEDIA["masterplan-poster"].darkSrc}
                    alt={MEDIA["masterplan-poster"].alt}
                    width={1920}
                    height={1080}
                    loading="lazy"
                    className="h-auto w-full object-cover"
                    style={{ aspectRatio: "16/9" }}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ SECTION 4 — FIRST NATIONS ═══════════ */}
      <ScrollRevealSection delay={100}>
        <section className="bg-(--pc-color-neutral-50) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-900)" aria-labelledby="first-nations-heading">
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-8 border-t border-(--pc-color-neutral-300) pt-8">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-500)">
                {t("home.firstNations.sectionLabel")}
              </div>
            </div>
            <blockquote className="m-0 font-serif text-[clamp(24px,3vw,40px)] font-normal leading-[1.2] tracking-[-0.01em] max-w-[36ch]">
              <h2 id="first-nations-heading" className="sr-only">{t("home.firstNations.heading")}</h2>
              {t("home.firstNations.prose")}
            </blockquote>
            <a
              href={`${prefix}/first-nations`}
              className="mt-8 inline-flex items-center gap-2 font-sans text-sm text-(--pc-color-neutral-600) no-underline transition-opacity duration-200 hover:opacity-65"
            >
              {t("home.firstNations.readCommitment")} <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ SECTION 5 — FIRST SITE ADVANTAGE ═══════════ */}
      <ScrollRevealSection delay={0}>
        <section className="bg-(--pc-color-neutral-100) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-900)" aria-labelledby="first-site-heading">
          <h2 id="first-site-heading" className="sr-only">{t("home.firstSite.sectionLabel")}</h2>
          <div className="mx-auto grid max-w-[1720px] grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
                {t("home.firstSite.sectionLabel")}
              </div>
            </div>
            <blockquote className="m-0 font-serif text-[clamp(24px,3vw,40px)] font-normal leading-[1.2] tracking-[-0.01em] lg:col-start-3 lg:col-span-10">
              {t("home.firstSite.quote")}{" "}
              <span className="text-(--pc-color-secondary-500)">
                {t("home.firstSite.quoteHighlight")}
              </span>
            </blockquote>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ SECTION 7 — AUDIENCE ROUTING ═══════════ */}
      <ScrollRevealSection delay={100}>
        <section className="bg-(--pc-color-neutral-50) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-900)" aria-labelledby="audience-heading">
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-12 border-t border-(--pc-color-neutral-300) pt-8">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-500)">
                {t("home.audience.sectionLabel")}
              </div>
              <h2 id="audience-heading" className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                {t("home.audience.heading")}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-[clamp(16px,2vw,32px)] sm:grid-cols-2">
              {audiences.map((a) => (
                <a
                  key={a.num}
                  href={a.href}
                  className="flex flex-col justify-between border border-(--pc-color-neutral-300) p-6 no-underline transition-colors duration-200 hover:border-(--pc-color-neutral-500)"
                >
                  <div className="mb-6 font-serif text-2xl text-(--pc-color-neutral-400)">{a.num}</div>
                  <div>
                    <h3 className="m-0 font-serif text-[clamp(18px,2vw,24px)] font-normal leading-[1.2]">{a.title}</h3>
                    <p className="mt-2 text-sm text-(--pc-color-neutral-600)">{a.text}</p>
                  </div>
                  <div className="mt-6 text-sm text-(--pc-color-neutral-500)">
                    {t("home.audience.enter")} <span aria-hidden="true">→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ CHORUS ═══════════ */}
      <section className="bg-(--pc-color-neutral-950) px-(--pc-spacing-6) py-[clamp(80px,12vw,200px)] text-center" aria-labelledby="chorus-heading">
        <h2 id="chorus-heading" className="sr-only">{t("home.chorus.text")}</h2>
        <div className="font-serif text-[clamp(48px,8vw,120px)] font-normal leading-[0.95] tracking-[-0.02em] text-(--pc-color-neutral-100)">
          {t("home.chorus.text")}
        </div>
      </section>

      {/* ═══════════ EOI ═══════════ */}
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

