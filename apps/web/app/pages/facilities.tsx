/**
 * Facilities page — matches reference/facilities.html design.
 * Page hero, alternating facility sections with plate placeholders,
 * spec grids, services lead-in, forward-looking disclaimer, EOI.
 */

"use client";

import {
  LandingPageTemplate,
  ForwardLookingDisclaimer,
  EOISection,
  ScrollRevealSection,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";

export function FacilitiesPage() {
  return (
    <I18nProvider>
      <FacilitiesPageContent />
    </I18nProvider>
  );
}

/* ─── Facility data ─── */
interface FacilityData {
  id: string;
  slug: string;
  label: string;
  heading: string;
  description: string;
  plate: {
    corner: string;
    cornerR: string;
    label: string;
    bottomL: string;
    bottomR: string;
  };
  specs: Array<{ label: string; value: string }>;
  ctaLabel: string;
  imagePosition: "left" | "right";
  bgClass: string;
}

const FACILITY_HEADINGS = {
  hero: "Built together. Not retrofitted.",
  controlRoom: "The nerve centre.",
  services: "Every facility is supported by the full creative service stack, on the same campus.",
} as const;

const FACILITIES: FacilityData[] = [
  {
    id: "screen-stages",
    slug: "screen-sound-stages",
    label: "A · SCREEN SOUND STAGES",
    heading: "Grand-scale screen work.",
    description: "Feature film. Episodic television. Live broadcast. Each stage is 45 m × 45 m, 15 m to grid, full-coverage catwalk. Designed against the technical specifications of major-studio and streamer productions.",
    plate: {
      corner: "A · SCREEN SOUND STAGE",
      cornerR: "2,025 m²",
      label: "[ STAGE INTERIOR · FULL-SURROUND LED ]",
      bottomL: "45 × 45 m",
      bottomR: "H 15 m",
    },
    specs: [
      { label: "Floor area", value: "2,025 m² · 21,797 ft²" },
      { label: "To grid", value: "15 m · 49 ft" },
      { label: "Acoustics", value: "NRC 1.05 · NC 25" },
      { label: "LED volume", value: "Flat · Arc · Full-surround" },
    ],
    ctaLabel: "Read the spec",
    imagePosition: "left",
    bgClass: "bg-(--pc-color-neutral-900)",
  },
  {
    id: "commercial-stages",
    slug: "commercial-sound-stages",
    label: "B · COMMERCIAL SOUND STAGES",
    heading: "Small footprint. Full specification.",
    description: "Commercials, TVCs, music videos, short-form, and digital. Same 15 m to grid. Same acoustics. Walk-in-ready LED configurations.",
    plate: {
      corner: "B · COMMERCIAL STAGE",
      cornerR: "100 m²",
      label: "[ WALK-IN LED · SHORT-FORM SHOOT ]",
      bottomL: "10 × 10 m",
      bottomR: "H 15 m",
    },
    specs: [
      { label: "Floor area", value: "100 m² · 1,076 ft²" },
      { label: "To grid", value: "15 m · 49 ft" },
      { label: "Acoustics", value: "NRC 1.05 · NC 25" },
      { label: "LED volume", value: "Flat · Arc · Full-surround" },
    ],
    ctaLabel: "Read the spec",
    imagePosition: "right",
    bgClass: "bg-(--pc-color-neutral-950)",
  },
  {
    id: "broadcast-theatre",
    slug: "broadcast-theatre",
    label: "C · BROADCAST THEATRE",
    heading: "Theatre wired for broadcast.",
    description: "Multi-modal live venue with a broadcast gallery wrapped around it. Robotic cameras, AR/VR-ready, broadcast-partner compliant.",
    plate: {
      corner: "C · BROADCAST THEATRE",
      cornerR: "450 SEATS",
      label: "[ AUDIENCE MODE · GALLERY LIVE ]",
      bottomL: "THEATRE · CABARET",
      bottomR: "AR / VR READY",
    },
    specs: [
      { label: "Theatre", value: "450 seats" },
      { label: "Cabaret", value: "300 seats" },
      { label: "Robotic cameras", value: "8 integrated positions" },
      { label: "Virtual sets", value: "Library + bespoke" },
    ],
    ctaLabel: "Read the spec",
    imagePosition: "left",
    bgClass: "bg-(--pc-color-neutral-900)",
  },
];

function FacilitiesPageContent() {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* ═══════════ PAGE HERO ═══════════ */}
      <section className="bg-(--pc-color-neutral-950) px-(--pc-spacing-6) py-[clamp(80px,12vw,160px)] text-(--pc-color-neutral-100)" aria-labelledby="facilities-heading">
        <div className="mx-auto max-w-[1720px]">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-400)">
            Facilities — 01/04
          </div>
          <h1 id="facilities-heading" className="mt-6 font-serif text-[clamp(40px,6vw,96px)] font-normal leading-[1.0] tracking-[-0.015em]">
            {FACILITY_HEADINGS.hero}
          </h1>
          <p className="mt-6 max-w-[42ch] text-[clamp(19px,1.6vw,24px)] leading-[1.45] text-(--pc-color-neutral-300)">
            The stages, the volume, the theatre, and the control room were designed as one system. Specifications below are the specifications.
          </p>
        </div>
      </section>

      {/* ═══════════ FACILITY SECTIONS A, B, C ═══════════ */}
      {FACILITIES.map((f) => (
        <ScrollRevealSection key={f.id} delay={100}>
          <section
            id={f.id}
            aria-labelledby={`${f.id}-heading`}
            className={`${f.bgClass} px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-100) border-t border-(--pc-color-neutral-800)`}
          >
            <div className="mx-auto max-w-[1720px]">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                {/* Plate placeholder — decorative, information conveyed by text + spec grid */}
                <div className={`lg:col-span-6 ${f.imagePosition === "right" ? "lg:order-2 lg:col-start-7" : ""}`} aria-hidden="true">
                  <div className="relative flex aspect-[4/3] flex-col justify-between border border-(--pc-color-neutral-700) bg-(--pc-color-neutral-950) p-5">
                    <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
                      <span>{f.plate.corner}</span>
                      <span>{f.plate.cornerR}</span>
                    </div>
                    <div className="text-center font-mono text-xs uppercase tracking-[0.1em] text-(--pc-color-neutral-600)">
                      {f.plate.label}
                    </div>
                    <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
                      <span>{f.plate.bottomL}</span>
                      <span>{f.plate.bottomR}</span>
                    </div>
                  </div>
                </div>

                {/* Text + specs */}
                <div className={`${f.imagePosition === "right" ? "lg:col-span-5 lg:order-1" : "lg:col-start-8 lg:col-span-5"}`}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                    {f.label}
                  </div>
                  <h2 id={`${f.id}-heading`} className="mt-4 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                    {f.heading}
                  </h2>
                  <p className="mt-4 max-w-[44ch] text-(--pc-color-neutral-300)">
                    {f.description}
                  </p>

                  {/* Spec grid */}
                  <div className="mt-8 flex flex-col gap-3">
                    {f.specs.map((s) => (
                      <div key={s.label} className="flex justify-between border-b border-(--pc-color-neutral-800) pb-3">
                        <span className="font-mono text-xs text-(--pc-color-neutral-500)">{s.label}</span>
                        <span className="text-sm text-(--pc-color-neutral-200)">{s.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <a
                      href={`${prefix}/facilities/${f.slug}`}
                      className="inline-flex items-center gap-2 border border-(--pc-color-neutral-100) px-6 py-3 text-sm text-(--pc-color-neutral-100) no-underline transition-opacity duration-200 hover:opacity-65"
                    >
                      {f.ctaLabel} <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollRevealSection>
      ))}

      {/* ═══════════ D — CONTROL ROOM ═══════════ */}
      <ScrollRevealSection delay={100}>
        <section
          id="control-room"
          aria-labelledby="control-room-heading"
          className="border-t border-(--pc-color-neutral-800) bg-(--pc-color-neutral-950) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-100)"
        >
          <div className="mx-auto max-w-[1720px]">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              {/* Text */}
              <div className="lg:col-span-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                  D · BROADCAST CONTROL ROOM
                </div>
                <h2 id="control-room-heading" className="mt-4 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                  {FACILITY_HEADINGS.controlRoom}
                </h2>
                <p className="mt-4 max-w-[44ch] text-(--pc-color-neutral-300)">
                  Central synchronisation. Live broadcast control across on-campus stages, the theatre, and external sports and event venues globally.
                </p>
                <ul className="mt-8 list-none space-y-2 p-0 font-mono text-xs tracking-[0.08em]">
                  <li>→ CENTRALISED PRODUCTION MANAGEMENT</li>
                  <li>→ LIVE BROADCAST CONTROL</li>
                  <li>→ ADVANCED SYNCHRONISATION</li>
                  <li>→ MULTI-PLATFORM · MULTI-LOCATION</li>
                </ul>
                <div className="mt-8">
                  <a
                    href={`${prefix}/facilities#control-room`}
                    className="inline-flex items-center gap-2 border border-(--pc-color-neutral-100) px-6 py-3 text-sm text-(--pc-color-neutral-100) no-underline transition-opacity duration-200 hover:opacity-65"
                  >
                    Read the capability <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>

              {/* Plate */}
              <div className="lg:col-start-7 lg:col-span-6">
                <div className="relative flex aspect-[4/3] flex-col justify-between border border-(--pc-color-neutral-700) bg-(--pc-color-neutral-950) p-5">
                  <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
                    <span>D · CONTROL ROOM</span>
                    <span>CENTRAL SPINE</span>
                  </div>
                  <div className="text-center font-mono text-xs uppercase tracking-[0.1em] text-(--pc-color-neutral-600)">
                    [ GALLERY · LIVE ORIGINATION ]
                  </div>
                  <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-(--pc-color-neutral-500)">
                    <span>ON-CAMPUS + EXTERNAL</span>
                    <span>GLOBAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ SERVICES LEAD-IN ═══════════ */}
      <ScrollRevealSection delay={0}>
        <section className="bg-(--pc-color-neutral-50) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-900)" aria-labelledby="services-lead-heading">
          <div className="mx-auto grid max-w-[1720px] gap-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-500)">
              Integrated services
            </div>
            <h2 id="services-lead-heading" className="m-0 max-w-[24ch] font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
              {FACILITY_HEADINGS.services}
            </h2>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ EOI ═══════════ */}
      <div id="eoi-section" className="border-t border-border">
        <EOISection
          heading={t("facilities.eoi.heading")}
          contextText={t("facilities.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory="producer"
          onSubmit={handleEoiSubmit}
        />
      </div>

      {/* ═══════════ DISCLAIMER ═══════════ */}
      <ForwardLookingDisclaimer text={t("facilities.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
