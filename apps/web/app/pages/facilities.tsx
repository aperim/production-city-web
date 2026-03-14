/**
 * Facilities page component — deep-dive into Production City's planned facilities.
 * All text from i18n, all content pre-groundbreaking (future tense).
 */

"use client";

import {
  LandingPageTemplate,
  FacilityShowcase,
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

export function FacilitiesPage() {
  return (
    <I18nProvider>
      <FacilitiesPageContent />
    </I18nProvider>
  );
}

function FacilitiesPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* 1. Overview */}
      <section className="py-12 sm:py-16" aria-labelledby="facilities-heading">
        <h1 id="facilities-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
          {t("facilities.overview.heading")}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          {t("facilities.overview.intro")}
        </p>
      </section>

      {/* 2. Screen Sound Stages */}
      <FacilityShowcase
        heading={t("facilities.screenStages.name")}
        intro={t("facilities.screenStages.description")}
        facilities={[
          {
            name: t("facilities.screenStages.name"),
            description: t("facilities.screenStages.description"),
            specs: [
              { label: t("facilities.screenStages.usage"), value: t("facilities.screenStages.usageFilm") },
              { label: t("facilities.screenStages.ledConfigs"), value: t("facilities.screenStages.ledConfigs") },
              { label: t("facilities.screenStages.soundproofing"), value: t("facilities.screenStages.soundproofing") },
            ],
          },
        ]}
      />

      {/* 3. Commercial Sound Stages */}
      <FacilityShowcase
        heading={t("facilities.commercialStages.name")}
        intro={t("facilities.commercialStages.description")}
        facilities={[
          {
            name: t("facilities.commercialStages.name"),
            description: t("facilities.commercialStages.description"),
            specs: [
              { label: t("facilities.commercialStages.usage"), value: t("facilities.commercialStages.usageTvc") },
            ],
          },
        ]}
      />

      {/* 4. Broadcast Theatre */}
      <FacilityShowcase
        heading={t("facilities.broadcastTheatre.name")}
        intro={t("facilities.broadcastTheatre.description")}
        facilities={[
          {
            name: t("facilities.broadcastTheatre.name"),
            description: t("facilities.broadcastTheatre.description"),
            specs: [
              { label: t("facilities.broadcastTheatre.seating"), value: `${t("facilities.broadcastTheatre.theatre")} / ${t("facilities.broadcastTheatre.cabaret")}` },
              { label: t("facilities.broadcastTheatre.cameras"), value: t("facilities.broadcastTheatre.cameras") },
              { label: t("facilities.broadcastTheatre.compliance"), value: t("facilities.broadcastTheatre.compliance") },
            ],
          },
        ]}
      />

      {/* 5. Broadcast Control Room */}
      <section className="py-8" aria-labelledby="control-heading">
        <h2 id="control-heading" className="text-xl font-semibold text-foreground">
          {t("facilities.controlRoom.name")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("facilities.controlRoom.description")}
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("facilities.controlRoom.management")}</li>
          <li className="text-sm text-muted-foreground">{t("facilities.controlRoom.broadcast")}</li>
          <li className="text-sm text-muted-foreground">{t("facilities.controlRoom.sync")}</li>
        </ul>
      </section>

      {/* 6. Ancillary Spaces */}
      <section className="py-8" aria-labelledby="ancillary-heading">
        <h2 id="ancillary-heading" className="text-xl font-semibold text-foreground">
          {t("facilities.ancillary.heading")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("facilities.ancillary.description")}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.recordingStudio")}</p>
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.dressingRooms")}</p>
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.storage")}</p>
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.orchestraPit")}</p>
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.offices")}</p>
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.restaurant")}</p>
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.kitchen")}</p>
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.exhibition")}</p>
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.foyer")}</p>
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.warehouse")}</p>
          <p className="text-sm text-muted-foreground">{t("facilities.ancillary.laundry")}</p>
        </div>
      </section>

      {/* 7. Producer EOI */}
      <div id="eoi-section">
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
