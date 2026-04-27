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
  AcknowledgementOfCountry,
  LandingPageTemplate,
  EOISection,
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
    { num: "I", title: t("home.audience.cards.producers.title"), text: t("home.audience.cards.producers.text"), href: "#eoi-section" },
    { num: "II", title: t("home.audience.cards.government.title"), text: t("home.audience.cards.government.text"), href: "#eoi-section" },
    { num: "III", title: t("home.audience.cards.investors.title"), text: t("home.audience.cards.investors.text"), href: "#eoi-section" },
    { num: "IV", title: t("home.audience.cards.techPartners.title"), text: t("home.audience.cards.techPartners.text"), href: "#eoi-section" },
  ];

  const regions = [
    { region: t("home.network.regions.australia.region"), status: t("home.network.regions.australia.status"), highlight: true },
    { region: t("home.network.regions.europe.region"), status: t("home.network.regions.europe.status"), highlight: true },
    { region: t("home.network.regions.asiaPacific.region"), status: t("home.network.regions.asiaPacific.status"), highlight: false },
    { region: t("home.network.regions.africa.region"), status: t("home.network.regions.africa.status"), highlight: false },
    { region: t("home.network.regions.unitedStates.region"), status: t("home.network.regions.unitedStates.status"), highlight: false },
  ];

  const serviceKeys = [
    "home.servicesSection.services.virtualProduction",
    "home.servicesSection.services.setConstruction",
    "home.servicesSection.services.props",
    "home.servicesSection.services.costume",
    "home.servicesSection.services.makeupProsthetics",
    "home.servicesSection.services.specialEffects",
    "home.servicesSection.services.stuntsRigging",
    "home.servicesSection.services.motionCapture",
    "home.servicesSection.services.audioMusic",
    "home.servicesSection.services.scriptScreenplay",
    "home.servicesSection.services.graphicDesign",
    "home.servicesSection.services.animationMotion",
    "home.servicesSection.services.cgi",
    "home.servicesSection.services.postProduction",
    "home.servicesSection.services.arVr",
    "home.servicesSection.services.broadcastCoordination",
  ] as const;

  return (
    <LandingPageTemplate nav={{ ...nav, transparent: true }} footer={footer}>
      <HomeStructuredData />
      <DublinCoreMeta
        title="Production City — Integrated Screen & Stage Campus"
        description="Australia's first purpose-built integrated screen and stage production campus in Queensland, combining sound stages, broadcast theatre, studio offices, and shared infrastructure."
        subject="film studio, screen production, stage production, Queensland, Australia, integrated campus"
        path="/"
        date="2026-04-27"
      />
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative flex min-h-dvh flex-col justify-end bg-(--pc-color-neutral-950) px-(--pc-spacing-6) pb-12 text-(--pc-color-neutral-100)" aria-labelledby="hero-heading">
        {/* Hero background image */}
        {MEDIA["home-hero"] && (
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img
              src={MEDIA["home-hero"].lightSrc}
              alt=""
              width={1920}
              height={1080}
              loading="eager"
              className="h-full w-full object-cover opacity-40"
              style={{ objectPosition: "center 40%" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.35) 100%)",
              }}
            />
          </div>
        )}
        <div className="mx-auto w-full max-w-[1720px]">
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

        <div className="mx-auto mt-12 flex w-full max-w-[1720px] items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
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

      {/* ═══════════ SECTION 3 — SERVICES LINE ═══════════ */}
      <ScrollRevealSection delay={0}>
        <section className="border-t border-(--pc-color-neutral-800) bg-(--pc-color-neutral-950) px-(--pc-spacing-6) py-[clamp(40px,5vw,80px)] text-(--pc-color-neutral-100)" aria-labelledby="services-heading">
          <div className="mx-auto grid max-w-[1720px] gap-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-secondary-500)">
              {t("home.servicesSection.sectionLabel")}
            </div>
            <h2 id="services-heading" className="m-0 max-w-[20ch] font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
              {t("home.servicesSection.heading")}
            </h2>
            <p className="flex flex-wrap gap-x-1 font-mono text-[11px] uppercase tracking-[0.1em] text-(--pc-color-neutral-400)">
              {serviceKeys.map((k, i) => (
                <span key={k}>
                  {t(k)}{i < serviceKeys.length - 1 && <span className="mx-1 opacity-40">·</span>}
                </span>
              ))}
            </p>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ SECTION 4 — FIRST NATIONS ═══════════ */}
      <ScrollRevealSection delay={100}>
        <section className="bg-(--pc-color-neutral-50) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-900)" aria-labelledby="first-nations-heading">
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-12 border-t border-(--pc-color-neutral-300) pt-8">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-500)">
                {t("home.firstNations.sectionLabel")}
              </div>
              <h2 id="first-nations-heading" className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                {t("home.firstNations.heading")}
              </h2>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="aspect-[3/4] overflow-hidden border-l-[3px] border-[#B45A2A]">
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

              {/* First Nations text */}
              <div className="lg:col-start-7 lg:col-span-6">
                <p className="font-serif text-[clamp(22px,2vw,28px)] leading-[1.4]" style={{ maxWidth: "30ch" }}>
                  {t("home.firstNations.prose")}
                </p>
                <p className="mt-8 text-(--pc-color-neutral-600)">
                  {t("home.firstNations.proseMatthew")}
                </p>
              </div>
            </div>
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

      {/* ═══════════ SECTION 6 — NETWORK SEQUENCE ═══════════ */}
      <ScrollRevealSection delay={100}>
        <section className="bg-(--pc-color-neutral-900) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-100)" aria-labelledby="network-heading">
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-12 border-t border-(--pc-color-neutral-800) pt-8">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-400)">
                {t("home.network.sectionLabel")}
              </div>
              <h2 id="network-heading" className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                {t("home.network.heading")}
              </h2>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              {/* Mini world map */}
              <div className="lg:col-span-5">
                <NetworkMap />
              </div>

              {/* Region table */}
              <div className="lg:col-start-7 lg:col-span-6">
                <table className="w-full border-collapse text-sm">
                  <caption className="sr-only">{t("home.network.tableCaption")}</caption>
                  <thead>
                    <tr className="border-b border-(--pc-color-neutral-800)">
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                        {t("home.network.tableHeaderRegion")}
                      </th>
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                        {t("home.network.tableHeaderStatus")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map((r) => (
                      <tr key={r.region} className="border-b border-(--pc-color-neutral-800)">
                        <td className="py-3 text-(--pc-color-neutral-100)">{r.region}</td>
                        <td className={`py-3 ${r.highlight ? "text-(--pc-color-neutral-100)" : "text-(--pc-color-neutral-500)"}`}>
                          {r.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

      {/* ═══════════ ACKNOWLEDGEMENT OF COUNTRY ═══════════ */}
      <ScrollRevealSection direction="fade">
        <AcknowledgementOfCountry
          heading={t("home.acknowledgement.heading")}
          text={t("footer.acknowledgement")}
        />
      </ScrollRevealSection>

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

/* ─── Network Map (minimal SVG) ─── */
function NetworkMap() {
  return (
    <svg viewBox="0 0 500 300" className="block w-full" aria-hidden="true">
      <rect width="500" height="300" fill="var(--pc-color-neutral-900)" />
      {/* Americas */}
      <path d="M60 90 Q80 70 100 80 Q120 100 110 130 Q105 160 115 190 Q120 220 100 240 Q80 250 70 230 Q55 200 60 170 Z" fill="var(--pc-color-neutral-800)" />
      {/* Europe / Africa */}
      <path d="M220 70 Q240 60 260 70 Q275 90 270 110 L265 120 Q280 130 275 160 Q270 200 260 240 Q245 260 235 245 Q220 220 225 180 Q215 140 220 110 Z" fill="var(--pc-color-neutral-800)" />
      {/* Asia */}
      <path d="M310 70 Q340 60 370 75 Q400 90 420 110 Q440 130 430 150 Q410 170 380 165 Q355 175 340 165 Q320 150 315 130 Q305 100 310 80 Z" fill="var(--pc-color-neutral-800)" />
      {/* Australia */}
      <path d="M395 200 Q420 195 440 210 Q455 225 450 240 Q440 255 420 255 Q395 250 385 235 Q385 215 395 200 Z" fill="var(--pc-color-neutral-800)" />
      {/* Region dots — uniform size, no special highlight */}
      <circle cx="80" cy="120" r="4" fill="var(--pc-color-secondary-500)" />
      <circle cx="243" cy="88" r="4" fill="var(--pc-color-secondary-500)" />
      <circle cx="255" cy="185" r="4" fill="var(--pc-color-secondary-500)" />
      <circle cx="380" cy="140" r="4" fill="var(--pc-color-secondary-500)" />
      <circle cx="430" cy="230" r="4" fill="var(--pc-color-secondary-500)" />
      <g fontFamily="monospace" fontSize="7" fill="var(--pc-color-neutral-500)" letterSpacing="1">
        <text x="80" y="110" textAnchor="middle">N. AMERICA</text>
        <text x="243" y="80" textAnchor="middle">EUROPE</text>
        <text x="255" y="198" textAnchor="middle">AFRICA</text>
        <text x="380" y="132" textAnchor="middle">ASIA PACIFIC</text>
        <text x="430" y="250" textAnchor="middle">AUSTRALIA</text>
      </g>
    </svg>
  );
}
