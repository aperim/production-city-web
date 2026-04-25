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
import {
  useLandingNav,
  useLandingFooter,
} from "../lib/use-landing-layout";

export function CompanyTeamPage() {
  return (
    <I18nProvider>
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
                aria-label="Troy Kelly — portrait"
              >
                <div className="flex justify-between"><span>T. KELLY</span><span>CEO</span></div>
                <span className="text-center">[ PORTRAIT ]</span>
                <div className="flex justify-between"><span>FOUNDER</span><span>CHIEF EXECUTIVE</span></div>
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
                <p>troy@team.production.city</p>
                <p>AU +61 2 9137 9100 · US +1 650 215 6253</p>
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
                className="aspect-[3/4] flex flex-col justify-between p-4 text-xs font-mono tracking-widest text-muted-foreground border"
                style={{ borderLeft: "3px solid var(--ochre, oklch(0.72 0.15 60))", borderColor: "var(--border)" }}
                aria-label="Matthew Compton — portrait commissioned with permission"
              >
                <div className="flex justify-between"><span>M. COMPTON</span><span>COO · MD</span></div>
                <span className="text-center">[ PORTRAIT · CONSENTED ]</span>
                <div className="flex justify-between"><span>WIRADJURI</span><span>MD</span></div>
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
                aria-label={`Executive ${n} — bio pending`}
              >
                <div className="flex justify-between"><span>TBC</span><span>{String(n).padStart(2, "0")}</span></div>
                <span className="text-center">[ BIO PENDING ]</span>
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
