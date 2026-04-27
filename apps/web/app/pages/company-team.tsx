/**
 * Company team page.
 * Route: /company/team
 */

"use client";

import {
  LandingPageTemplate,
  ScrollRevealSection,
  ForwardLookingDisclaimer,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import type { SupportedLocale } from "../i18n/index.js";
import {
  useLandingNav,
  useLandingFooter,
} from "../lib/use-landing-layout";
import { CompanyTeamStructuredData, DublinCoreMeta } from "../lib/structured-data";
import { MEDIA } from "../lib/media-config";


interface CompanyTeamPageProps {
  serverLocale?: SupportedLocale;
}

export function CompanyTeamPage({ serverLocale }: CompanyTeamPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <CompanyTeamPageContent />
    </I18nProvider>
  );
}

function CompanyTeamPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <CompanyTeamStructuredData />
      <DublinCoreMeta
        title="Team — Production City"
        description="Meet the team building Australia's integrated screen and stage campus."
        subject="team, leadership, executive, Production City, Queensland"
        path="/company/team"
        date="2026-04-27"
      />
      {/* Hero */}
      <section className="py-16 border-b border-border" aria-labelledby="page-heading">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">
          {t("companyTeam.eyebrow")}
        </p>
        <h1 id="page-heading" className="text-3xl font-semibold text-foreground sm:text-4xl">
          {t("companyTeam.heading")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          {t("companyTeam.lead")}
        </p>
      </section>

      {/* Troy Kelly */}
      <ScrollRevealSection delay={0}>
        <article className="py-16 border-b border-border" aria-labelledby="troy-heading">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <div
                className="aspect-[3/4] border border-border flex flex-col justify-between p-4 text-xs font-mono tracking-widest text-muted-foreground"
                aria-label={t("companyTeam.troyPortraitAriaLabel")}
              >
                <div className="flex justify-between"><span>{t("companyTeam.troyPortraitInitials")}</span><span>{t("companyTeam.roleCeo")}</span></div>
                <span className="text-center">{t("companyTeam.portraitPlaceholder")}</span>
                <div className="flex justify-between"><span>{t("companyTeam.roleFounder")}</span><span>{t("companyTeam.roleChiefExecutive")}</span></div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
                {t("companyTeam.troyRole")}
              </p>
              <h2 id="troy-heading" className="mt-2 text-2xl font-semibold text-foreground">
                {t("companyTeam.troyName")}
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{t("companyTeam.troyBio1")}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("companyTeam.troyBio2")}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("companyTeam.troyBio3")}</p>
              </div>
              <div className="mt-6 text-xs font-mono text-muted-foreground leading-relaxed">
                <p>{t("companyTeam.troyEmail")}</p>
                <p>{t("companyTeam.troyPhone")}</p>
              </div>
            </div>
          </div>
        </article>
      </ScrollRevealSection>

      {/* Matthew Compton */}
      <ScrollRevealSection delay={0}>
        <article className="py-16 border-b border-border" aria-labelledby="matthew-heading">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <div
                className="aspect-[3/4] overflow-hidden border"
                style={{ borderLeft: "3px solid var(--ochre, oklch(0.72 0.15 60))", borderColor: "var(--border)" }}
              >
                <img
                  src={MEDIA["team-matthew-compton"]?.darkSrc ?? "/media/team-matthew-compton/dark.jpg"}
                  alt={t("companyTeam.matthewPortraitAlt")}
                  width={900}
                  height={1200}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-7">
              <p
                className="text-xs font-mono tracking-widest uppercase"
                style={{ color: "var(--ochre, oklch(0.72 0.15 60))" }}
              >
                {t("companyTeam.matthewRole")}
              </p>
              <h2 id="matthew-heading" className="mt-2 text-2xl font-semibold text-foreground">
                {t("companyTeam.matthewName")}
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{t("companyTeam.matthewBio1")}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("companyTeam.matthewBio2")}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{t("companyTeam.matthewBio3")}</p>
              </div>
            </div>
          </div>
        </article>
      </ScrollRevealSection>

      {/* Additional executives */}
      <ScrollRevealSection delay={0}>
        <section className="py-16 border-b border-border" aria-labelledby="additional-heading">
          <h2 id="additional-heading" className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-6">
            {t("companyTeam.additionalLabel")}
          </h2>
          <p className="text-lg text-foreground leading-relaxed max-w-xl mb-10" style={{ fontFamily: "var(--font-serif, serif)" }}>
            {t("companyTeam.additionalDesc")}
          </p>
          {/* Pending portrait grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="aspect-[3/4] border border-border flex flex-col justify-between p-3 text-xs font-mono tracking-widest text-muted-foreground"
                aria-label={t("companyTeam.executivePendingAriaLabel", { n })}
              >
                <div className="flex justify-between"><span>{t("companyTeam.tbc")}</span><span>{String(n).padStart(2, "0")}</span></div>
                <span className="text-center">{t("companyTeam.bioPending")}</span>
                <div />
              </div>
            ))}
          </div>
        </section>
      </ScrollRevealSection>

      <ForwardLookingDisclaimer text={t("facilities.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
