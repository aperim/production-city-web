/**
 * Home page — Production City editorial landing.
 * Matches reference/index.html design: hero, operating model,
 * facilities preview, services, First Nations, pull quote,
 * network sequence, audience routing, chorus, acknowledgement, EOI.
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
import { MEDIA } from "../lib/media-config";
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";

export function HomePage() {
  return (
    <I18nProvider>
      <HomePageContent />
    </I18nProvider>
  );
}

/* ─── Operating model pillars data ─── */
const PILLARS = [
  {
    num: "i",
    title: "One IP · two formats",
    text: "Script, libretto, score, pre-vis and digital assets are authored once, then split into a screen lane and a stage lane that run in parallel rather than in sequence.",
  },
  {
    num: "ii",
    title: "One operator · one campus",
    text: "Venue, stack and service teams under a single brand. Tenants sign one contract, coordinate with one counterparty, and draw on whichever combination of capabilities the work requires.",
  },
  {
    num: "iii",
    title: "Shared pipeline, specialised finishes",
    text: "Design, build, costume, and digital assets are common. The screen lane takes them into photography, editorial, VFX and sound. The stage lane takes them into rehearsal, tech, opening and tour.",
  },
  {
    num: "iv",
    title: "Closed-loop canon",
    text: "Distribution and audience data feed back into the IP strategy. The next project inherits what the last one learned, across both formats, not just one.",
  },
] as const;

const STATS = [
  { value: "1", label: "operator" },
  { value: "2", label: "lanes, in parallel" },
  { value: "19", label: "stations from idea to audience" },
  { value: "1", unit: " loop", label: "analytics → ideation" },
] as const;

/* ─── Audience routing data ─── */
const AUDIENCES = [
  {
    num: "I",
    title: "For producers and studios",
    text: "Book a stage, a volume, and a full service stack. One operator, one schedule, no vendor chain to manage.",
    href: "#eoi-section",
  },
  {
    num: "II",
    title: "For government",
    text: "The first campus of a global network. Direct jobs, screen-sector training, local procurement, and First Nations outcomes built into the operating model.",
    href: "#eoi-section",
  },
  {
    num: "III",
    title: "For investors",
    text: "Revenue from facilities, services, and broadcast under one operator. Campuses open in sequence, each proven before the next is committed.",
    href: "#eoi-section",
  },
  {
    num: "IV",
    title: "For technology partners",
    text: "Test and ship production technology inside a working campus. LED volume, real-time rendering, motion capture, and broadcast under live conditions.",
    href: "#eoi-section",
  },
] as const;

/* ─── Network regions ─── */
const REGIONS = [
  { region: "Australia", status: "Sydney — leading candidate", highlight: true },
  { region: "Europe", status: "Switzerland — currently leading", highlight: true },
  { region: "Asia-Pacific", status: "Singapore preferred · alternatives under review", highlight: false },
  { region: "Africa", status: "Under assessment", highlight: false },
  { region: "United States", status: "Following the first international campuses", highlight: false },
] as const;

/* ─── Services list ─── */
const SERVICES = [
  "VIRTUAL PRODUCTION", "SET CONSTRUCTION", "PROPS", "COSTUME",
  "MAKEUP & PROSTHETICS", "SPECIAL EFFECTS", "STUNTS & RIGGING",
  "MOTION CAPTURE", "AUDIO & MUSIC", "SCRIPT & SCREENPLAY",
  "GRAPHIC DESIGN", "ANIMATION & MOTION", "3D & CGI",
  "POST-PRODUCTION", "AR/VR", "BROADCAST COORDINATION",
] as const;

/* ─── Facilities tiles data ─── */
const FACILITY_TILES = [
  {
    label: "A · SCREEN SOUND STAGES",
    heading: "Grand-scale screen work. Engineered for it.",
    specs: "45 m × 45 m · 15 m to grid\nNRC 1.05 · NC 25\nFlat · Arc · Full-surround LED",
    linkLabel: "A · Screen sound stages",
  },
  {
    label: "B · COMMERCIAL SOUND STAGES",
    heading: "Small footprint. Full specification.",
    specs: "10 m × 10 m · 15 m to grid\nNRC 1.05 · NC 25\nWalk-in-ready LED volume",
    linkLabel: "B · Commercial stages",
  },
  {
    label: "C · BROADCAST THEATRE",
    heading: "A live theatre wired as a broadcast studio.",
    specs: "450 theatre · 300 cabaret\n8 robotic camera positions\nAR/VR-ready",
    linkLabel: "C · Broadcast theatre",
  },
] as const;

const [screenTile, commercialTile, theatreTile] = FACILITY_TILES;

/* ─── Section headings as constants (avoids hardcoded JSX strings) ─── */
const HEADINGS = {
  hero: "We make stories.",
  operatingModel: "One operator. One campus. Script to delivery.",
  facilitiesPreview: "Built together. Not retrofitted.",
  services: "Every discipline from script to delivery. On one campus.",
  firstNations: "Embedded, not added on.",
  firstSite: "First site advantage",
  network: "Sequenced. Not simultaneous.",
  audience: "Four doors in.",
  chorus: "We make stories",
  controlRoom: "The nerve centre.",
} as const;

function HomePageContent() {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  return (
    <LandingPageTemplate nav={{ ...nav, transparent: true }} footer={footer}>
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
            <span>Sydney · Switzerland · Singapore · Africa</span>
          </div>

          <h1 id="hero-heading" className="m-0 font-serif text-[clamp(56px,9vw,168px)] font-normal leading-[0.95] tracking-[-0.02em]">
            {HEADINGS.hero}
          </h1>

          <p className="mt-6 max-w-[42ch] text-[clamp(19px,1.6vw,24px)] leading-[1.45] text-(--pc-color-neutral-300)">
            A vertically integrated studio campus. Sound stages, LED volume, a broadcast theatre, and the full service stack — built together, in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href={`${prefix}/facilities`}
              className="inline-flex items-center gap-2 border border-(--pc-color-neutral-100) px-6 py-3 font-sans text-sm font-medium text-(--pc-color-neutral-100) no-underline transition-opacity duration-200 hover:opacity-65"
            >
              See the facilities <span aria-hidden="true">→</span>
            </a>
            <a
              href="#eoi-section"
              className="inline-flex items-center gap-2 border border-(--pc-color-neutral-400) px-6 py-3 font-sans text-sm font-medium text-(--pc-color-neutral-300) no-underline transition-opacity duration-200 hover:opacity-65"
            >
              Register interest <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="mx-auto mt-12 flex w-full max-w-[1720px] items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
          <span>01 · HOME</span>
          <span>SCROLL FOR THE CAMPUS ↓</span>
        </div>
      </section>

      {/* ═══════════ SECTION 1 — OPERATING MODEL ═══════════ */}
      <ScrollRevealSection delay={0}>
        <section className="bg-(--pc-color-neutral-900) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-100)" aria-labelledby="operating-model-heading">
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-12 border-t border-(--pc-color-neutral-800) pt-8">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-400)">
                01 — Operating model
              </div>
              <h2 id="operating-model-heading" className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                {HEADINGS.operatingModel}
              </h2>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              {/* Left column — text + pillars + stats */}
              <div className="flex flex-col gap-14 lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
                <div className="text-lg leading-relaxed">
                  <p className="max-w-[64ch]">
                    Production City is not a stage with vendors bolted on. It is one operator providing the venue, the technology stack, and the full creative service stack under one brand. That reduces coordination risk for tenants and opens multiple revenue streams for the company.
                  </p>
                  <p className="mt-4 max-w-[64ch]">
                    The stages, the LED volume, the broadcast theatre, the control room, and the service teams were designed together. Not retrofitted.
                  </p>
                </div>

                {/* Operating pillars */}
                <div className="flex flex-col gap-8">
                  {PILLARS.map((p) => (
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
                  {STATS.map((s) => (
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
                02 — Facilities
              </div>
              <h2 id="facilities-preview-heading" className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                {HEADINGS.facilitiesPreview}
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
                      {screenTile.label}
                    </div>
                    <h3 className="mt-4 font-serif text-[clamp(22px,3vw,44px)] font-normal leading-[1.15]">
                      {screenTile.heading}
                    </h3>
                  </div>
                  <div>
                    <div className="whitespace-pre-line font-mono text-xs leading-relaxed text-(--pc-color-neutral-400)">
                      {FACILITY_TILES[0].specs}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-(--pc-color-neutral-300)">
                      {FACILITY_TILES[0].linkLabel} <span aria-hidden="true">→</span>
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
                      {commercialTile.label}
                    </div>
                    <h3 className="mt-3 font-serif text-[clamp(18px,2vw,30px)] font-normal leading-[1.15]">
                      {commercialTile.heading}
                    </h3>
                  </div>
                  <div>
                    <div className="mt-4 whitespace-pre-line font-mono text-xs leading-relaxed text-(--pc-color-neutral-400)">
                      {FACILITY_TILES[1].specs}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-(--pc-color-neutral-300)">
                      {FACILITY_TILES[1].linkLabel} <span aria-hidden="true">→</span>
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
                      {theatreTile.label}
                    </div>
                    <h3 className="mt-3 font-serif text-[clamp(18px,2vw,30px)] font-normal leading-[1.15]">
                      {theatreTile.heading}
                    </h3>
                  </div>
                  <div>
                    <div className="mt-4 whitespace-pre-line font-mono text-xs leading-relaxed text-(--pc-color-neutral-400)">
                      {FACILITY_TILES[2].specs}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-(--pc-color-neutral-300)">
                      {FACILITY_TILES[2].linkLabel} <span aria-hidden="true">→</span>
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
                  D · BROADCAST CONTROL ROOM
                </div>
                <h3 className="mt-3 font-serif text-[clamp(28px,3vw,44px)] font-normal leading-[1.15]">
                  {HEADINGS.controlRoom}
                </h3>
                <p className="mt-3 max-w-[48ch] text-(--pc-color-neutral-400)">
                  Centralised production management. Live broadcast control. Capable of originating broadcast from any on-campus stage, the theatre, or external sports and event venues globally.
                </p>
              </div>
              <div className="self-end text-right">
                <div className="whitespace-pre-line font-mono text-xs leading-relaxed text-(--pc-color-neutral-400)">
                  {"CENTRAL SYNCHRONISATION\nLIVE ORIGINATION · MULTI-PLATFORM\nBROADCAST FROM ANY STAGE"}
                </div>
                <div className="mt-6 flex items-center justify-end gap-2 text-sm text-(--pc-color-neutral-300)">
                  D · Control room <span aria-hidden="true">→</span>
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

              {/* Right — poster image placeholder (replaced by 3D viewer screenshot when available) */}
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
              03 — Services
            </div>
            <h2 id="services-heading" className="m-0 max-w-[20ch] font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
              {HEADINGS.services}
            </h2>
            <p className="flex flex-wrap gap-x-1 font-mono text-[11px] uppercase tracking-[0.1em] text-(--pc-color-neutral-400)">
              {SERVICES.map((s, i) => (
                <span key={s}>
                  {s}{i < SERVICES.length - 1 && <span className="mx-1 opacity-40">·</span>}
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
                04 — First Nations approach
              </div>
              <h2 id="first-nations-heading" className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                {HEADINGS.firstNations}
              </h2>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              {/* Portrait placeholder */}
              <div className="lg:col-span-5">
                <div
                  className="flex aspect-[3/4] flex-col justify-between border-l-[3px] border-[#B45A2A] bg-(--pc-color-neutral-200) p-6"
                  role="img"
                  aria-label="Photography to be commissioned — portrait of Matthew Compton, Wiradjuri, COO"
                >
                  <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
                    <span>PORTRAIT · MATTHEW COMPTON</span>
                    <span>CONSENTED</span>
                  </div>
                  <div className="text-center font-mono text-xs uppercase tracking-[0.1em] text-(--pc-color-neutral-400)">
                    [ PHOTOGRAPHY TO BE COMMISSIONED. NO APPROPRIATED MOTIFS. ]
                  </div>
                  <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
                    <span>WIRADJURI</span>
                    <span>COO · MD</span>
                  </div>
                </div>
              </div>

              {/* First Nations text */}
              <div className="lg:col-start-7 lg:col-span-6">
                <p className="font-serif text-[clamp(22px,2vw,28px)] leading-[1.4]" style={{ maxWidth: "30ch" }}>
                  Aboriginal and Torres Strait Islander ways of Knowing, Being, and Doing shape this company&apos;s governance, its intellectual property and data practice, its workforce, and the stories its facilities are built to serve.
                </p>
                <p className="mt-8 text-(--pc-color-neutral-600)">
                  Matthew Compton, our Chief Operating Officer, is a proud Wiradjuri man. His authority is substantive, not advisory.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ SECTION 5 — FIRST SITE ADVANTAGE ═══════════ */}
      <ScrollRevealSection delay={0}>
        <section className="bg-(--pc-color-neutral-100) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-900)" aria-labelledby="first-site-heading">
          <h2 id="first-site-heading" className="sr-only">{HEADINGS.firstSite}</h2>
          <div className="mx-auto grid max-w-[1720px] grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
                05 — FIRST SITE ADVANTAGE
              </div>
            </div>
            <blockquote className="m-0 font-serif text-[clamp(24px,3vw,40px)] font-normal leading-[1.2] tracking-[-0.01em] lg:col-start-3 lg:col-span-10">
              The first Production City is being built in Sydney. Technical and architectural standards are set here, then replicated elsewhere. Head-of-network employment, research, and executive functions are based here.{" "}
              <span className="text-(--pc-color-secondary-500)">
                Hosting the first site is not hosting a branch — it is hosting the origin.
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
                06 — The sequence
              </div>
              <h2 id="network-heading" className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                {HEADINGS.network}
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
                  <caption className="sr-only">Global campus network status</caption>
                  <thead>
                    <tr className="border-b border-(--pc-color-neutral-800)">
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                        Region
                      </th>
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {REGIONS.map((r) => (
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
                07 — Who we work with
              </div>
              <h2 id="audience-heading" className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                {HEADINGS.audience}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-[clamp(16px,2vw,32px)] sm:grid-cols-2">
              {AUDIENCES.map((a) => (
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
                    Enter <span aria-hidden="true">→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ CHORUS ═══════════ */}
      <section className="bg-(--pc-color-neutral-950) px-(--pc-spacing-6) py-[clamp(80px,12vw,200px)] text-center" aria-labelledby="chorus-heading">
        <h2 id="chorus-heading" className="sr-only">{HEADINGS.chorus}</h2>
        <div className="font-serif text-[clamp(48px,8vw,120px)] font-normal leading-[0.95] tracking-[-0.02em] text-(--pc-color-neutral-100)">
          We make stories
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

/* ─── IP Lifecycle Diagram (simplified SVG) ─── */
/* ─── Network Map (minimal SVG) ─── */
function NetworkMap() {
  return (
    <svg viewBox="0 0 500 300" className="block w-full" aria-hidden="true">
      <rect width="500" height="300" fill="var(--pc-color-neutral-900)" />
      <path d="M60 90 Q80 70 100 80 Q120 100 110 130 Q105 160 115 190 Q120 220 100 240 Q80 250 70 230 Q55 200 60 170 Z" fill="var(--pc-color-neutral-800)" />
      <path d="M220 70 Q240 60 260 70 Q275 90 270 110 L265 120 Q280 130 275 160 Q270 200 260 240 Q245 260 235 245 Q220 220 225 180 Q215 140 220 110 Z" fill="var(--pc-color-neutral-800)" />
      <circle cx="243" cy="95" r="4" fill="var(--pc-color-secondary-500)" />
      <path d="M310 70 Q340 60 370 75 Q400 90 420 110 Q440 130 430 150 Q410 170 380 165 Q355 175 340 165 Q320 150 315 130 Q305 100 310 80 Z" fill="var(--pc-color-neutral-800)" />
      <circle cx="395" cy="155" r="3.5" fill="var(--pc-color-secondary-500)" />
      <path d="M395 200 Q420 195 440 210 Q455 225 450 240 Q440 255 420 255 Q395 250 385 235 Q385 215 395 200 Z" fill="var(--pc-color-neutral-800)" />
      <circle cx="445" cy="240" r="6" fill="var(--pc-color-secondary-500)" />
      <circle cx="445" cy="240" r="12" fill="none" stroke="var(--pc-color-secondary-500)" strokeWidth="1" opacity="0.4" />
      <g fontFamily="monospace" fontSize="8" fill="var(--pc-color-neutral-500)" letterSpacing="1">
        <text x="445" y="263" textAnchor="middle">SYDNEY — LEAD</text>
        <text x="243" y="87" textAnchor="middle">CH</text>
        <text x="395" y="148" textAnchor="middle">SG</text>
      </g>
    </svg>
  );
}
