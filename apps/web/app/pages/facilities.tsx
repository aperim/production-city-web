/**
 * Facilities page — matches reference/facilities.html design.
 * Page hero, alternating facility sections with curated Pexels images,
 * spec grids, services lead-in, forward-looking disclaimer, EOI.
 */

"use client";

import {
  LandingPageTemplate,
  ForwardLookingDisclaimer,
  EOISection,
  ScrollRevealSection,
  MediaHero,
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
import { FacilitiesStructuredData } from "../lib/structured-data";


interface FacilitiesPageProps {
  serverLocale?: SupportedLocale;
}

export function FacilitiesPage({ serverLocale }: FacilitiesPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
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
  mediaKey: string;
  specs: Array<{ label: string; value: string }>;
  ctaLabel: string;
  imagePosition: "left" | "right";
  bgClass: string;
}

function FacilitiesPageContent() {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const facilities: FacilityData[] = [
    {
      id: "screen-stages",
      slug: "screen-sound-stages",
      label: t("facilities.page.screenStages.label"),
      heading: t("facilities.page.screenStages.heading"),
      description: t("facilities.page.screenStages.description"),
      mediaKey: "facilities-screen-stage",
      specs: [
        { label: t("facilities.page.screenStages.spec.floorAreaLabel"), value: t("facilities.page.screenStages.spec.floorAreaValue") },
        { label: t("facilities.page.screenStages.spec.toGridLabel"), value: t("facilities.page.screenStages.spec.toGridValue") },
        { label: t("facilities.page.screenStages.spec.acousticsLabel"), value: t("facilities.page.screenStages.spec.acousticsValue") },
        { label: t("facilities.page.screenStages.spec.ledLabel"), value: t("facilities.page.screenStages.spec.ledValue") },
      ],
      ctaLabel: t("facilities.page.cta"),
      imagePosition: "left",
      bgClass: "bg-(--pc-color-neutral-900)",
    },
    {
      id: "commercial-stages",
      slug: "commercial-sound-stages",
      label: t("facilities.page.commercialStages.label"),
      heading: t("facilities.page.commercialStages.heading"),
      description: t("facilities.page.commercialStages.description"),
      mediaKey: "facilities-commercial-stage",
      specs: [
        { label: t("facilities.page.commercialStages.spec.floorAreaLabel"), value: t("facilities.page.commercialStages.spec.floorAreaValue") },
        { label: t("facilities.page.commercialStages.spec.toGridLabel"), value: t("facilities.page.commercialStages.spec.toGridValue") },
        { label: t("facilities.page.commercialStages.spec.acousticsLabel"), value: t("facilities.page.commercialStages.spec.acousticsValue") },
        { label: t("facilities.page.commercialStages.spec.ledLabel"), value: t("facilities.page.commercialStages.spec.ledValue") },
      ],
      ctaLabel: t("facilities.page.cta"),
      imagePosition: "right",
      bgClass: "bg-(--pc-color-neutral-950)",
    },
    {
      id: "broadcast-theatre",
      slug: "broadcast-theatre",
      label: t("facilities.page.broadcastTheatre.label"),
      heading: t("facilities.page.broadcastTheatre.heading"),
      description: t("facilities.page.broadcastTheatre.description"),
      mediaKey: "facilities-broadcast-theatre",
      specs: [
        { label: t("facilities.page.broadcastTheatre.spec.theatreLabel"), value: t("facilities.page.broadcastTheatre.spec.theatreValue") },
        { label: t("facilities.page.broadcastTheatre.spec.cabaretLabel"), value: t("facilities.page.broadcastTheatre.spec.cabaretValue") },
        { label: t("facilities.page.broadcastTheatre.spec.camerasLabel"), value: t("facilities.page.broadcastTheatre.spec.camerasValue") },
        { label: t("facilities.page.broadcastTheatre.spec.virtualSetsLabel"), value: t("facilities.page.broadcastTheatre.spec.virtualSetsValue") },
      ],
      ctaLabel: t("facilities.page.cta"),
      imagePosition: "left",
      bgClass: "bg-(--pc-color-neutral-900)",
    },
  ];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <FacilitiesStructuredData />
      {/* ═══════════ PAGE HERO ═══════════ */}
      {MEDIA["facilities-hero"] && (
        <MediaHero
          lightSrc={MEDIA["facilities-hero"].lightSrc}
          darkSrc={MEDIA["facilities-hero"].darkSrc}
          alt={MEDIA["facilities-hero"].alt}
          width={MEDIA["facilities-hero"].width}
          height={600}
          averageColor={MEDIA["facilities-hero"].averageColor}
          photographer={MEDIA["facilities-hero"].photographer}
          photographerUrl={MEDIA["facilities-hero"].photographerUrl}
          source={MEDIA["facilities-hero"].source}
          sourceUrl={MEDIA["facilities-hero"].sourceUrl}
        >
          <div className="pb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
              {t("facilities.page.hero.eyebrow")}
            </p>
            <h1 id="facilities-heading" className="mt-4 font-serif text-[clamp(40px,6vw,96px)] font-normal leading-[1.0] tracking-[-0.015em] text-white">
              {t("facilities.page.hero.heading")}
            </h1>
            <p className="mt-6 max-w-[42ch] text-[clamp(17px,1.4vw,22px)] leading-[1.45] text-white/80">
              {t("facilities.page.hero.description")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* ═══════════ FACILITY SECTIONS A, B, C ═══════════ */}
      {facilities.map((f) => {
        const facilityMedia = MEDIA[f.mediaKey];
        return (
        <ScrollRevealSection key={f.id} delay={100}>
          <section
            id={f.id}
            aria-labelledby={`${f.id}-heading`}
            className={`${f.bgClass} px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-100) border-t border-(--pc-color-neutral-800)`}
          >
            <div className="mx-auto max-w-[1720px]">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                {/* Facility image */}
                <div className={`lg:col-span-6 ${f.imagePosition === "right" ? "lg:order-2 lg:col-start-7" : ""}`}>
                  {facilityMedia && (
                    <img
                      src={facilityMedia.lightSrc}
                      alt={facilityMedia.alt}
                      width={1920}
                      height={1080}
                      loading="lazy"
                      className="h-auto w-full object-cover"
                      style={{ aspectRatio: "4/3" }}
                    />
                  )}
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
        );
      })}

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
                  {t("facilities.page.controlRoom.label")}
                </div>
                <h2 id="control-room-heading" className="mt-4 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
                  {t("facilities.controlRoom.detail.heading")}
                </h2>
                <p className="mt-4 max-w-[44ch] text-(--pc-color-neutral-300)">
                  {t("facilities.page.controlRoom.description")}
                </p>
                <ul className="mt-8 list-none space-y-2 p-0 font-mono text-xs tracking-[0.08em]">
                  <li>→ {t("facilities.page.controlRoom.bullet1")}</li>
                  <li>→ {t("facilities.page.controlRoom.bullet2")}</li>
                  <li>→ {t("facilities.page.controlRoom.bullet3")}</li>
                  <li>→ {t("facilities.page.controlRoom.bullet4")}</li>
                </ul>
                <div className="mt-8">
                  <a
                    href={`${prefix}/facilities#control-room`}
                    className="inline-flex items-center gap-2 border border-(--pc-color-neutral-100) px-6 py-3 text-sm text-(--pc-color-neutral-100) no-underline transition-opacity duration-200 hover:opacity-65"
                  >
                    {t("facilities.page.controlRoom.cta")} <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>

              {/* Control room image */}
              <div className="lg:col-start-7 lg:col-span-6">
                {MEDIA["facilities-control-room"] && (
                  <img
                    src={MEDIA["facilities-control-room"].lightSrc}
                    alt={MEDIA["facilities-control-room"].alt}
                    width={1920}
                    height={1080}
                    loading="lazy"
                    className="h-auto w-full object-cover"
                    style={{ aspectRatio: "4/3" }}
                  />
                )}
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
              {t("facilities.page.services.eyebrow")}
            </div>
            <h2 id="services-lead-heading" className="m-0 max-w-[24ch] font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]">
              {t("facilities.page.services.heading")}
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
