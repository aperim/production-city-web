/**
 * Facilities page — deep-dive into Production City's planned facilities.
 * Hero with media, facility sections with images, specs, persona CTAs.
 * All text from i18n, all content pre-groundbreaking (future tense).
 */

"use client";

import {
  LandingPageTemplate,
  MediaHero,
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
import { MEDIA } from "../lib/media-config";

export function FacilitiesPage() {
  return (
    <I18nProvider>
      <FacilitiesPageContent />
    </I18nProvider>
  );
}

/** Facility section with image and specs */
function FacilitySection({
  id,
  heading,
  description,
  imageSrc,
  imageAlt,
  specs,
}: {
  id: string;
  heading: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  specs?: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="py-10 border-t border-border" aria-labelledby={`${id}-heading`}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        {imageSrc && (
          <div className="overflow-hidden rounded-sm">
            <img
              src={imageSrc}
              alt={imageAlt ?? ""}
              width={1920}
              height={1080}
              loading="lazy"
              className="h-auto w-full object-cover"
              style={{ aspectRatio: "16 / 9" }}
            />
          </div>
        )}
        <div>
          <h2 id={`${id}-heading`} className="text-xl font-semibold text-foreground">
            {heading}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {description}
          </p>
          {specs && specs.length > 0 && (
            <div className="mt-4 border border-border rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {specs.map((spec, i) => (
                    <tr key={spec.label} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">
                        {spec.label}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function FacilitiesPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const heroMedia = MEDIA["facilities-hero"];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* Hero */}
      {heroMedia && (
        <MediaHero
          lightSrc={heroMedia.lightSrc}
          darkSrc={heroMedia.darkSrc}
          alt={heroMedia.alt}
          width={heroMedia.width}
          height={heroMedia.height}
          averageColor={heroMedia.averageColor}
          photographer={heroMedia.photographer}
          source={heroMedia.source}
          className="max-h-[60vh] -mx-4 sm:-mx-6"
        >
          <div className="pb-8">
            <h1 id="page-heading" className="text-3xl font-semibold text-white sm:text-4xl">
              {t("facilities.overview.heading")}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-white/90">
              {t("facilities.overview.intro")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* Screen Sound Stages */}
      <FacilitySection
        id="screen-stages"
        heading={t("facilities.screenStages.name")}
        description={t("facilities.screenStages.description")}
        imageSrc={MEDIA["facilities-screen-stage"]?.lightSrc}
        imageAlt={MEDIA["facilities-screen-stage"]?.alt}
        specs={[
          { label: t("facilities.screenStages.usage"), value: t("facilities.screenStages.usageFilm") },
          { label: t("facilities.screenStages.ledConfigs"), value: t("facilities.screenStages.ledConfigs") },
          { label: t("facilities.screenStages.soundproofing"), value: t("facilities.screenStages.soundproofing") },
        ]}
      />

      {/* Commercial Sound Stages */}
      <FacilitySection
        id="commercial-stages"
        heading={t("facilities.commercialStages.name")}
        description={t("facilities.commercialStages.description")}
        imageSrc={MEDIA["facilities-commercial-stage"]?.lightSrc}
        imageAlt={MEDIA["facilities-commercial-stage"]?.alt}
        specs={[
          { label: t("facilities.commercialStages.usage"), value: t("facilities.commercialStages.usageTvc") },
        ]}
      />

      {/* Broadcast Theatre */}
      <FacilitySection
        id="broadcast-theatre"
        heading={t("facilities.broadcastTheatre.name")}
        description={t("facilities.broadcastTheatre.description")}
        imageSrc={MEDIA["facilities-broadcast-theatre"]?.lightSrc}
        imageAlt={MEDIA["facilities-broadcast-theatre"]?.alt}
        specs={[
          { label: t("facilities.broadcastTheatre.seating"), value: `${t("facilities.broadcastTheatre.theatre")} / ${t("facilities.broadcastTheatre.cabaret")}` },
          { label: t("facilities.broadcastTheatre.cameras"), value: t("facilities.broadcastTheatre.cameras") },
          { label: t("facilities.broadcastTheatre.compliance"), value: t("facilities.broadcastTheatre.compliance") },
        ]}
      />

      {/* Broadcast Control Room */}
      <FacilitySection
        id="control-room"
        heading={t("facilities.controlRoom.name")}
        description={t("facilities.controlRoom.description")}
        imageSrc={MEDIA["facilities-control-room"]?.lightSrc}
        imageAlt={MEDIA["facilities-control-room"]?.alt}
        specs={[
          { label: t("facilities.controlRoom.management"), value: t("facilities.controlRoom.management") },
          { label: t("facilities.controlRoom.broadcast"), value: t("facilities.controlRoom.broadcast") },
          { label: t("facilities.controlRoom.sync"), value: t("facilities.controlRoom.sync") },
        ]}
      />

      {/* Ancillary Spaces */}
      <section className="py-10 border-t border-border" aria-labelledby="ancillary-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
          {MEDIA["facilities-ancillary"] && (
            <div className="overflow-hidden rounded-sm">
              <img
                src={MEDIA["facilities-ancillary"].lightSrc}
                alt={MEDIA["facilities-ancillary"].alt}
                width={1920}
                height={1080}
                loading="lazy"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "16 / 9" }}
              />
            </div>
          )}
          <div>
            <h2 id="ancillary-heading" className="text-xl font-semibold text-foreground">
              {t("facilities.ancillary.heading")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("facilities.ancillary.description")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                "recordingStudio", "dressingRooms", "storage",
                "orchestraPit", "offices", "restaurant",
                "kitchen", "exhibition", "foyer",
                "warehouse", "laundry",
              ].map((key) => (
                <div key={key} className="border-l-2 border-muted pl-3 py-1">
                  <p className="text-sm text-foreground">{t(`facilities.ancillary.${key}` as Parameters<typeof t>[0])}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Producer EOI */}
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
    </LandingPageTemplate>
  );
}
