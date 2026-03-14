/**
 * Community & Engagement page component — education, sustainability, and partnerships.
 * All text from i18n, all content pre-groundbreaking (future tense).
 */

"use client";

import {
  LandingPageTemplate,
  ForwardLookingDisclaimer,
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

export function CommunityPage() {
  return (
    <I18nProvider>
      <CommunityPageContent />
    </I18nProvider>
  );
}

function CommunityPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* 1. Introduction */}
      <section className="py-12 sm:py-16" aria-labelledby="community-heading">
        <h1 id="community-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
          {t("community.heading")}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          {t("community.intro")}
        </p>
      </section>

      {/* 2. Education & Innovation */}
      <section className="py-8" aria-labelledby="education-heading">
        <h2 id="education-heading" className="text-xl font-semibold text-foreground">
          {t("community.education.heading")}
        </h2>
        <ul className="mt-4 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("community.education.strategy1")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.strategy2")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.strategy3")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.strategy4")}</li>
        </ul>

        <h3 className="mt-6 text-sm font-semibold text-foreground">
          {t("community.education.rdHeading")}
        </h3>
        <ul className="mt-2 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("community.education.rd1")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.rd2")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.rd3")}</li>
        </ul>

        <h3 className="mt-6 text-sm font-semibold text-foreground">
          {t("community.education.crossSector")}
        </h3>
        <ul className="mt-2 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("community.education.crossSector1")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.crossSector2")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.crossSector3")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.crossSector4")}</li>
        </ul>

        <h3 className="mt-6 text-sm font-semibold text-foreground">
          {t("community.education.outcomes")}
        </h3>
        <ul className="mt-2 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("community.education.outcome1")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.outcome2")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.outcome3")}</li>
          <li className="text-sm text-muted-foreground">{t("community.education.outcome4")}</li>
        </ul>
      </section>

      {/* 3. Sustainability */}
      <section className="py-8" aria-labelledby="sustainability-heading">
        <h2 id="sustainability-heading" className="text-xl font-semibold text-foreground">
          {t("community.sustainability.heading")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("community.sustainability.goal")}
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("community.sustainability.principle1")}</li>
          <li className="text-sm text-muted-foreground">{t("community.sustainability.principle2")}</li>
          <li className="text-sm text-muted-foreground">{t("community.sustainability.principle3")}</li>
          <li className="text-sm text-muted-foreground">{t("community.sustainability.principle4")}</li>
          <li className="text-sm text-muted-foreground">{t("community.sustainability.principle5")}</li>
          <li className="text-sm text-muted-foreground">{t("community.sustainability.principle6")}</li>
        </ul>
      </section>

      {/* 4. Synergies & Opportunities */}
      <section className="py-8" aria-labelledby="synergies-heading">
        <h2 id="synergies-heading" className="text-xl font-semibold text-foreground">
          {t("community.synergies.heading")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-border rounded-md p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("community.synergies.creators")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("community.synergies.creatorsItems")}
            </p>
          </div>
          <div className="border border-border rounded-md p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("community.synergies.industry")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("community.synergies.industryItems")}
            </p>
          </div>
          <div className="border border-border rounded-md p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("community.synergies.investors")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("community.synergies.investorsItems")}
            </p>
          </div>
          <div className="border border-border rounded-md p-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("community.synergies.communities")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("community.synergies.communitiesItems")}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Strategic Alliances */}
      <section className="py-8" aria-labelledby="alliances-heading">
        <h2 id="alliances-heading" className="text-xl font-semibold text-foreground">
          {t("community.alliances.heading")}
        </h2>
        <ul className="mt-4 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("community.alliances.type1")}</li>
          <li className="text-sm text-muted-foreground">{t("community.alliances.type2")}</li>
          <li className="text-sm text-muted-foreground">{t("community.alliances.type3")}</li>
          <li className="text-sm text-muted-foreground">{t("community.alliances.type4")}</li>
          <li className="text-sm text-muted-foreground">{t("community.alliances.type5")}</li>
        </ul>
        <h3 className="mt-6 text-sm font-semibold text-foreground">
          {t("community.alliances.valueHeading")}
        </h3>
        <ul className="mt-2 flex flex-col gap-2">
          <li className="text-sm text-muted-foreground">{t("community.alliances.value1")}</li>
          <li className="text-sm text-muted-foreground">{t("community.alliances.value2")}</li>
          <li className="text-sm text-muted-foreground">{t("community.alliances.value3")}</li>
          <li className="text-sm text-muted-foreground">{t("community.alliances.value4")}</li>
        </ul>
      </section>

      {/* 6. Building Bridges */}
      <section className="py-8" aria-labelledby="bridges-heading">
        <h2 id="bridges-heading" className="text-xl font-semibold text-foreground">
          {t("community.bridges.heading")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t("community.bridges.producers")}
            </h3>
            <ul className="mt-2 flex flex-col gap-2">
              <li className="text-sm text-muted-foreground">{t("community.bridges.producer1")}</li>
              <li className="text-sm text-muted-foreground">{t("community.bridges.producer2")}</li>
              <li className="text-sm text-muted-foreground">{t("community.bridges.producer3")}</li>
              <li className="text-sm text-muted-foreground">{t("community.bridges.producer4")}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t("community.bridges.government")}
            </h3>
            <ul className="mt-2 flex flex-col gap-2">
              <li className="text-sm text-muted-foreground">{t("community.bridges.gov1")}</li>
              <li className="text-sm text-muted-foreground">{t("community.bridges.gov2")}</li>
              <li className="text-sm text-muted-foreground">{t("community.bridges.gov3")}</li>
              <li className="text-sm text-muted-foreground">{t("community.bridges.gov4")}</li>
              <li className="text-sm text-muted-foreground">{t("community.bridges.gov5")}</li>
              <li className="text-sm text-muted-foreground">{t("community.bridges.gov6")}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. Community EOI */}
      <div id="eoi-section">
        <EOISection
          heading={t("community.eoi.heading")}
          contextText={t("community.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory="education"
          onSubmit={handleEoiSubmit}
        />
      </div>

      {/* 8. Forward-Looking Disclaimer */}
      <ForwardLookingDisclaimer text={t("community.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
