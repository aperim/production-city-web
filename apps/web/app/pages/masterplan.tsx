/**
 * Campus Masterplan page — interactive 3D campus viewer with CMO-directed narrative arc.
 * Hero: lazy-loaded Three.js viewer. Sections: positioning, stats, facility highlights,
 * circulation narrative, EOI, forward-looking disclaimer.
 * All text from i18n.
 */

"use client";

import { Suspense, lazy, useState } from "react";
import {
  LandingPageTemplate,
  ForwardLookingDisclaimer,
  EOISection,
  ScrollRevealSection,
} from "@productioncity/holding-ui";
import { facilities, accessRouteLegend } from "@productioncity/masterplan-viewer/data";
import type { Facility } from "@productioncity/masterplan-viewer";
import { I18nProvider, useTranslation } from "../i18n/context";
import { MEDIA } from "../lib/media-config";
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";

/* Lazy-load the viewer to code-split Three.js into a separate chunk */
const MasterplanViewer = lazy(() =>
  import("@productioncity/holding-ui").then((m) => ({
    default: m.MasterplanViewer,
  })),
);

export function MasterplanPage() {
  return (
    <I18nProvider>
      <MasterplanPageContent />
    </I18nProvider>
  );
}

/* ─── Facility → detail URL mapping ─── */
const FACILITY_DETAIL: Record<string, string> = {
  "broadcast-theatre": "/facilities/broadcast-theatre",
  "mega-stage-01": "/facilities/screen-sound-stages",
  "sound-stage-02": "/facilities/screen-sound-stages",
  "sound-stage-03": "/facilities/screen-sound-stages",
  "sound-stage-04": "/facilities/screen-sound-stages",
  "sound-stage-05": "/facilities/screen-sound-stages",
  "sound-stage-06": "/facilities/screen-sound-stages",
};

function facilityUrl(id: string): string {
  return FACILITY_DETAIL[id] ?? "/facilities";
}

/* ─── Category display order ─── */
const CATEGORY_ORDER: Array<Facility["category"]> = [
  "stage", "creative", "public", "support", "education", "logistics",
];

/* ─── Circulation kind → i18n key pairs ─── */
const CIRCULATION_KEYS: Record<string, { label: string; desc: string }> = {
  public: { label: "masterplan.circulation.public", desc: "masterplan.circulation.publicDesc" },
  secure: { label: "masterplan.circulation.secure", desc: "masterplan.circulation.secureDesc" },
  truck: { label: "masterplan.circulation.truck", desc: "masterplan.circulation.truckDesc" },
  pedestrian: { label: "masterplan.circulation.pedestrian", desc: "masterplan.circulation.pedestrianDesc" },
};

function MasterplanPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  /* Group facilities by category in display order */
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: facilities.filter((f) => f.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <LandingPageTemplate nav={nav} footer={footer}>

      {/* ═══════════ HERO — full-bleed 3D viewer ═══════════ */}
      <section
        className="relative -mx-4 sm:-mx-6 bg-(--pc-color-neutral-950)"
        aria-labelledby="masterplan-page-heading"
      >
        <div
          className="h-[70vh] min-h-[480px]"
          aria-label={t("masterplan.hero.ariaLabel")}
        >
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="relative h-full w-full overflow-hidden bg-(--pc-color-neutral-950)"
              >
                <div
                  className="absolute inset-0 animate-pulse"
                  style={{
                    background:
                      "radial-gradient(ellipse 90% 60% at 50% 55%, rgba(120,90,40,0.12) 0%, rgba(60,40,20,0.06) 50%, transparent 80%)",
                  }}
                />
              </div>
            }
          >
            <MasterplanViewer
              autoRotate
              className="h-full w-full"
              ariaLabel={t("masterplan.hero.ariaLabel")}
              posterSrc={MEDIA["masterplan-poster"]?.darkSrc}
              posterAlt={MEDIA["masterplan-poster"]?.alt}
              onFacilitySelect={(_id, facility) => setSelectedFacility(facility ?? null)}
            />
          </Suspense>
        </div>

        {/* Overlay — heading + tagline at bottom of hero */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 px-(--pc-spacing-6) pb-10 pt-24"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
          }}
        >
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-(--pc-color-neutral-400)">
              Production City™ — Campus
            </div>
            <h1
              id="masterplan-page-heading"
              className="m-0 font-serif text-[clamp(32px,5vw,72px)] font-normal leading-[1.05] tracking-[-0.02em] text-(--pc-color-neutral-100)"
            >
              {t("masterplan.hero.heading")}
            </h1>
            <p className="mt-3 max-w-[52ch] text-[clamp(16px,1.4vw,20px)] leading-[1.45] text-(--pc-color-neutral-300)">
              {t("masterplan.hero.tagline")}
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ FACILITY CLICK-THROUGH PANEL ═══════════ */}
      {selectedFacility && (
        <section
          className="-mx-4 sm:-mx-6 border-t-2 border-(--pc-color-primary-500) bg-(--pc-color-neutral-900) px-(--pc-spacing-6) py-6"
          aria-labelledby="selected-facility-name"
          aria-live="polite"
        >
          <div className="mx-auto flex max-w-[1720px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-secondary-500)">
                {selectedFacility.category}
              </div>
              <h2
                id="selected-facility-name"
                className="font-serif text-[clamp(18px,2vw,28px)] font-normal leading-[1.2] text-(--pc-color-neutral-100)"
              >
                {selectedFacility.name}
              </h2>
              <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-(--pc-color-neutral-400)">
                {selectedFacility.purpose}
              </p>
              {selectedFacility.metrics.length > 0 && (
                <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
                  {selectedFacility.metrics.slice(0, 3).map(([label, value]) => (
                    <div key={label}>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-(--pc-color-neutral-500)">
                        {label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium text-(--pc-color-neutral-200)">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <a
                href={facilityUrl(selectedFacility.id)}
                className="inline-flex items-center gap-2 border border-(--pc-color-neutral-100) px-5 py-2.5 font-sans text-sm font-medium text-(--pc-color-neutral-100) no-underline transition-opacity duration-200 hover:opacity-65"
              >
                {FACILITY_DETAIL[selectedFacility.id]
                  ? t("masterplan.panel.viewSpec")
                  : t("masterplan.panel.noSpec")}
              </a>
              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                className="text-xs text-(--pc-color-neutral-500) hover:text-(--pc-color-neutral-300) transition-colors"
              >
                {t("masterplan.panel.close")}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ STATS STRIP ═══════════ */}
      <ScrollRevealSection delay={0}>
        <section
          className="-mx-4 sm:-mx-6 bg-(--pc-color-neutral-900) px-(--pc-spacing-6) py-[clamp(48px,6vw,96px)] text-(--pc-color-neutral-100)"
          aria-labelledby="campus-stats-heading"
        >
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-10 border-t border-(--pc-color-neutral-800) pt-8">
              <h2
                id="campus-stats-heading"
                className="sr-only"
              >
                {t("masterplan.stats.heading")}
              </h2>
              <p className="font-serif text-[clamp(22px,2.5vw,36px)] font-normal leading-[1.2] text-(--pc-color-neutral-100)">
                {t("masterplan.hero.tagline")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {(
                [
                  [t("masterplan.stats.hectares"), t("masterplan.stats.hectaresUnit")],
                  [t("masterplan.stats.sqm"), t("masterplan.stats.sqmUnit")],
                  [t("masterplan.stats.facilities"), t("masterplan.stats.facilitiesUnit")],
                  [t("masterplan.stats.soundStages"), t("masterplan.stats.soundStagesUnit")],
                ] as [string, string][]
              ).map(([value, unit]) => (
                <div key={unit}>
                  <div className="font-serif text-[clamp(40px,5vw,64px)] font-normal leading-[0.85] tracking-[-0.03em] text-(--pc-color-neutral-100)">
                    {value}
                  </div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                    {unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ FACILITY HIGHLIGHTS ═══════════ */}
      <ScrollRevealSection delay={100}>
        <section
          className="-mx-4 sm:-mx-6 bg-(--pc-color-neutral-950) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-100)"
          aria-labelledby="facility-highlights-heading"
        >
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-12 border-t border-(--pc-color-neutral-800) pt-8">
              <h2
                id="facility-highlights-heading"
                className="m-0 font-serif text-[clamp(32px,4vw,56px)] font-normal leading-[1.05] tracking-[-0.01em]"
              >
                {t("masterplan.highlights.heading")}
              </h2>
            </div>

            <div className="flex flex-col gap-12">
              {grouped.map((group) => (
                <div key={group.category}>
                  <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-(--pc-color-neutral-400)">
                    {t(`masterplan.highlights.categories.${group.category}` as Parameters<typeof t>[0])}
                  </div>
                  <div className="grid grid-cols-1 gap-[clamp(12px,1.5vw,24px)] sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((facility) => (
                      <a
                        key={facility.id}
                        href={facilityUrl(facility.id)}
                        className="group flex flex-col justify-between border border-(--pc-color-neutral-800) p-5 no-underline transition-colors duration-200 hover:border-(--pc-color-neutral-600)"
                      >
                        <div>
                          <h3 className="font-serif text-[clamp(16px,1.5vw,22px)] font-normal leading-[1.3] text-(--pc-color-neutral-100)">
                            {facility.name}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-(--pc-color-neutral-400)">
                            {facility.purpose.length > 140
                              ? facility.purpose.slice(0, 140).trimEnd() + "…"
                              : facility.purpose}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-(--pc-color-neutral-300)">
                          {t("masterplan.highlights.viewSpec")}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ CIRCULATION NARRATIVE ═══════════ */}
      <ScrollRevealSection delay={100}>
        <section
          className="-mx-4 sm:-mx-6 bg-(--pc-color-neutral-50) px-(--pc-spacing-6) py-[clamp(56px,8vw,128px)] text-(--pc-color-neutral-900)"
          aria-labelledby="circulation-heading"
        >
          <div className="mx-auto max-w-[1720px]">
            <div className="mb-12 border-t border-(--pc-color-neutral-300) pt-8">
              <h2
                id="circulation-heading"
                className="m-0 font-serif text-[clamp(28px,3.5vw,48px)] font-normal leading-[1.05] tracking-[-0.01em]"
              >
                {t("masterplan.circulation.heading")}
              </h2>
              <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-(--pc-color-neutral-600)">
                {t("masterplan.circulation.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-[clamp(16px,2vw,32px)] sm:grid-cols-2">
              {accessRouteLegend.map((route) => {
                const keys = CIRCULATION_KEYS[route.kind];
                if (!keys) return null;
                return (
                  <div key={route.kind} className="flex gap-4 border border-(--pc-color-neutral-300) p-6">
                    <div
                      className="mt-1 h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: route.color }}
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-(--pc-color-neutral-900)">
                        {t(keys.label as Parameters<typeof t>[0])}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-(--pc-color-neutral-600)">
                        {t(keys.desc as Parameters<typeof t>[0])}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* ═══════════ EOI ═══════════ */}
      <ScrollRevealSection delay={100}>
        <div id="eoi-section" className="border-t border-border">
          <EOISection
            heading={t("masterplan.eoi.heading")}
            contextText={t("masterplan.eoi.context")}
            formLabels={eoiLabels}
            categories={eoiCategories}
            defaultCategory="general"
            onSubmit={handleEoiSubmit}
          />
        </div>
      </ScrollRevealSection>

      {/* ═══════════ FORWARD-LOOKING DISCLAIMER ═══════════ */}
      <ForwardLookingDisclaimer text={t("masterplan.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
