/**
 * Vision & Global Network page component — global vision and stakeholder value.
 * All text from i18n, all content pre-groundbreaking (future tense).
 */

"use client";

import {
  LandingPageTemplate,
  GlobalCampusMap,
  StakeholderGrid,
  ForwardLookingDisclaimer,
  EOISection,
} from "@productioncity/holding-ui";
import { useTranslation } from "../i18n/context";
import {
  useLandingNav,
  useLandingFooter,
  useEoiLabels,
  useEoiCategories,
  useEoiSubmit,
} from "../lib/use-landing-layout";

export function VisionPage() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* 1. Vision & Mission */}
      <section className="py-12 sm:py-16" aria-labelledby="vision-heading">
        <h1 id="vision-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
          {t("vision.mission.heading")}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          {t("vision.mission.vision")}
        </p>
      </section>

      {/* 2. Mission Themes */}
      <section className="py-8" aria-labelledby="themes-heading">
        <h2 id="themes-heading" className="text-xl font-semibold text-foreground">
          {t("vision.mission.themes")}
        </h2>
        <ul className="mt-4 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("vision.mission.theme1")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.mission.theme2")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.mission.theme3")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.mission.theme4")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.mission.theme5")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.mission.theme6")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.mission.theme7")}</li>
        </ul>
      </section>

      {/* 3. Philosophy */}
      <section className="py-8" aria-labelledby="philosophy-heading">
        <h2 id="philosophy-heading" className="text-xl font-semibold text-foreground">
          {t("vision.mission.philosophy")}
        </h2>
        <ul className="mt-4 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("vision.mission.phil1")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.mission.phil2")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.mission.phil3")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.mission.phil4")}</li>
        </ul>
      </section>

      {/* 4. Global Campus Network */}
      <GlobalCampusMap
        heading={t("vision.global.heading")}
        locations={[
          {
            name: t("vision.global.queensland"),
            status: t("vision.global.queenslandStatus"),
            description: t("vision.global.queenslandDesc"),
          },
          {
            name: t("vision.global.singapore"),
            status: t("vision.global.singaporeStatus"),
            description: t("vision.global.singaporeDesc"),
          },
          {
            name: t("vision.global.hawaii"),
            status: t("vision.global.hawaiiStatus"),
            description: t("vision.global.hawaiiDesc"),
          },
          {
            name: t("vision.global.europe"),
            status: t("vision.global.europeStatus"),
            description: t("vision.global.europeDesc"),
          },
          {
            name: t("vision.global.usa"),
            status: t("vision.global.usaStatus"),
            description: t("vision.global.usaDesc"),
          },
        ]}
      />

      {/* 5. Operating Model */}
      <section className="py-8">
        <p className="text-sm text-muted-foreground">
          {t("vision.global.operatingModel")}
        </p>
      </section>

      {/* 6. Market Position */}
      <section className="py-8" aria-labelledby="market-heading">
        <h2 id="market-heading" className="text-xl font-semibold text-foreground">
          {t("vision.market.heading")}
        </h2>
        <ul className="mt-4 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("vision.market.context1")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.market.context2")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.market.context3")}</li>
        </ul>
        <h3 className="mt-6 text-sm font-semibold text-foreground">
          {t("vision.market.accessibility")}
        </h3>
        <ul className="mt-2 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("vision.market.access1")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.market.access2")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.market.access3")}</li>
        </ul>
      </section>

      {/* 7. Why Production City */}
      <section className="py-8" aria-labelledby="why-heading">
        <h2 id="why-heading" className="text-xl font-semibold text-foreground">
          {t("vision.why.heading")}
        </h2>
        <ul className="mt-4 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("vision.why.arg1")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.why.arg2")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.why.arg3")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.why.arg4")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.why.arg5")}</li>
          <li className="text-sm text-muted-foreground">{t("vision.why.arg6")}</li>
        </ul>
      </section>

      {/* 8. Stakeholder Benefits */}
      <StakeholderGrid
        heading={t("vision.stakeholders.heading")}
        stakeholders={[
          {
            type: t("vision.stakeholders.creators"),
            description: t("vision.stakeholders.creatorsDesc"),
            benefits: [],
          },
          {
            type: t("vision.stakeholders.industry"),
            description: t("vision.stakeholders.industryDesc"),
            benefits: [],
          },
          {
            type: t("vision.stakeholders.investors"),
            description: t("vision.stakeholders.investorsDesc"),
            benefits: [],
          },
          {
            type: t("vision.stakeholders.governments"),
            description: t("vision.stakeholders.governmentsDesc"),
            benefits: [],
          },
        ]}
      />

      {/* 9. The Team */}
      <section className="py-8" aria-labelledby="team-heading">
        <h2 id="team-heading" className="text-xl font-semibold text-foreground">
          {t("vision.team.heading")}
        </h2>
        <div className="mt-4 border border-border rounded-md p-4">
          <h3 className="text-sm font-semibold text-foreground">
            {t("vision.team.leaderName")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("vision.team.leaderRole")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("vision.team.leaderBio")}
          </p>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("vision.team.teamDesc")}
        </p>
      </section>

      {/* 10. Partnership EOI */}
      <div id="eoi-section">
        <EOISection
          heading={t("vision.eoi.heading")}
          contextText={t("vision.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory="investor"
          onSubmit={handleEoiSubmit}
        />
      </div>

      {/* 11. Forward-Looking Disclaimer */}
      <ForwardLookingDisclaimer text={t("vision.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
