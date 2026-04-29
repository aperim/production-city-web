/**
 * Position Paper page — The Vertically Integrated Virtual Production Model.
 * Presents the EOI position paper adapted for web: hero, thesis, market stats,
 * case studies, failure modes, comparison grid, and conclusion.
 * All text from i18n.
 */

"use client";

import {
  LandingPageTemplate,
  MediaHero,
  ForwardLookingDisclaimer,
  EOISection,
  ScrollRevealSection,
  SectionHead,
  PullQuote,
  CaseStudyCard,
  ComparisonGrid,
  FailureModeCard,
  StatCallout,
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
import { DublinCoreMeta } from "../lib/structured-data";

interface PositionPaperPageProps {
  serverLocale?: SupportedLocale;
}

export function PositionPaperPage({ serverLocale }: PositionPaperPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <PositionPaperPageContent />
    </I18nProvider>
  );
}

function PositionPaperPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();

  const heroMedia = MEDIA["position-paper-hero"];
  const australiaMedia = MEDIA["position-paper-australia"];
  const caseStudyMedia = MEDIA["position-paper-case-study"];
  const techMedia = MEDIA["position-paper-technology"];

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <DublinCoreMeta
        title={t("positionPaper.meta.title")}
        description={t("positionPaper.meta.description")}
        subject="virtual production, VP infrastructure, integrated studio, Australia, NSW EOI"
        type="Text"
        path="/position-paper"
        date="2026-04-28"
      />

      {/* 1. Hero */}
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
            <p className="text-xs font-mono uppercase tracking-widest text-white/60 mb-2">
              {t("positionPaper.hero.eyebrow")}
            </p>
            <h1 id="page-heading" className="text-3xl font-semibold text-white sm:text-4xl max-w-2xl">
              {t("positionPaper.hero.heading")}
            </h1>
            <p className="mt-2 max-w-xl text-base text-white/90">
              {t("positionPaper.hero.subtitle")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* 2. Thesis statement */}
      <ScrollRevealSection delay={0}>
        <section className="py-12 border-b border-border" aria-labelledby="thesis-heading">
          <h2 id="thesis-heading" className="sr-only">{t("positionPaper.hero.heading")}</h2>
          <blockquote className="text-lg font-semibold text-foreground max-w-3xl leading-relaxed border-l-4 border-primary pl-6">
            {t("positionPaper.thesis.statement")}
          </blockquote>
        </section>
      </ScrollRevealSection>

      {/* 3. Market opportunity stats */}
      <ScrollRevealSection delay={100}>
        <section className="py-12 border-b border-border" aria-labelledby="market-heading">
          <SectionHead
            label={t("positionPaper.market.eyebrow")}
            heading={t("positionPaper.market.heading")}
            lead={t("positionPaper.market.body")}
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCallout
              value={t("positionPaper.market.stat1Value")}
              prefix={t("positionPaper.market.stat1Prefix")}
              suffix={t("positionPaper.market.stat1Suffix")}
              label={t("positionPaper.market.stat1Label")}
              context={t("positionPaper.market.stat1Context")}
              variant="accent"
            />
            <StatCallout
              value={t("positionPaper.market.stat2Value")}
              label={t("positionPaper.market.stat2Label")}
              context={t("positionPaper.market.stat2Context")}
            />
            <StatCallout
              value={t("positionPaper.market.stat3Value")}
              prefix={t("positionPaper.market.stat3Prefix")}
              suffix={t("positionPaper.market.stat3Suffix")}
              label={t("positionPaper.market.stat3Label")}
              context={t("positionPaper.market.stat3Context")}
              variant="muted"
            />
          </div>
        </section>
      </ScrollRevealSection>

      {/* 4. Australia's position with image */}
      <ScrollRevealSection delay={100}>
        <section className="py-12 border-b border-border" aria-labelledby="australia-heading">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            {australiaMedia && (
              <div className="overflow-hidden rounded-sm">
                <img
                  src={australiaMedia.darkSrc}
                  alt={australiaMedia.alt}
                  width={australiaMedia.width}
                  height={australiaMedia.height}
                  loading="lazy"
                  className="h-auto w-full object-cover"
                  style={{ aspectRatio: "4 / 3" }}
                />
              </div>
            )}
            <div>
              <SectionHead
                label={t("positionPaper.australia.eyebrow")}
                heading={t("positionPaper.australia.heading")}
                lead={t("positionPaper.australia.body")}
              />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <StatCallout
                  value={t("positionPaper.australia.stat1Value")}
                  label={t("positionPaper.australia.stat1Label")}
                  variant="muted"
                />
                <StatCallout
                  value={t("positionPaper.australia.stat2Value")}
                  label={t("positionPaper.australia.stat2Label")}
                  variant="muted"
                />
                <StatCallout
                  value={t("positionPaper.australia.stat3Value")}
                  label={t("positionPaper.australia.stat3Label")}
                  variant="muted"
                />
                <StatCallout
                  value={t("positionPaper.australia.stat4Value")}
                  label={t("positionPaper.australia.stat4Label")}
                  variant="muted"
                />
              </div>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* 5. Docklands case study */}
      <ScrollRevealSection delay={100}>
        <section className="py-12 border-b border-border" aria-labelledby="docklands-heading">
          <SectionHead
            label={t("positionPaper.docklands.eyebrow")}
            heading={t("positionPaper.docklands.heading")}
          />
          {caseStudyMedia && (
            <div className="mt-6 overflow-hidden rounded-sm">
              <img
                src={caseStudyMedia.darkSrc}
                alt={caseStudyMedia.alt}
                width={caseStudyMedia.width}
                height={caseStudyMedia.height}
                loading="lazy"
                className="h-auto w-full object-cover"
                style={{ aspectRatio: "16 / 7" }}
              />
            </div>
          )}
          <div className="mt-6 space-y-4 text-sm text-muted-foreground max-w-3xl">
            <p>{t("positionPaper.docklands.para1")}</p>
            <p>{t("positionPaper.docklands.para2")}</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCallout value={t("positionPaper.docklands.stat1Value")} label={t("positionPaper.docklands.stat1Label")} variant="muted" />
            <StatCallout value={t("positionPaper.docklands.stat2Value")} label={t("positionPaper.docklands.stat2Label")} variant="muted" />
            <StatCallout value={t("positionPaper.docklands.stat3Value")} label={t("positionPaper.docklands.stat3Label")} variant="muted" />
            <StatCallout value={t("positionPaper.docklands.stat4Value")} label={t("positionPaper.docklands.stat4Label")} variant="muted" />
          </div>
          <div className="mt-8">
            <PullQuote attribution={t("positionPaper.docklands.quoteAttribution")} wide>
              {t("positionPaper.docklands.quoteText")}
            </PullQuote>
          </div>
          <blockquote className="mt-8 text-base font-semibold text-foreground max-w-2xl border-l-4 border-primary pl-6">
            {t("positionPaper.docklands.closing")}
          </blockquote>
        </section>
      </ScrollRevealSection>

      {/* 6. Five failure modes */}
      <ScrollRevealSection delay={100}>
        <section className="py-12 border-b border-border" aria-labelledby="failure-modes-heading">
          <SectionHead
            label={t("positionPaper.failureModes.eyebrow")}
            heading={t("positionPaper.failureModes.heading")}
          />
          <div className="mt-8">
            <FailureModeCard
              items={[
                { number: 1, title: t("positionPaper.failureModes.item1Title"), description: t("positionPaper.failureModes.item1Desc") },
                { number: 2, title: t("positionPaper.failureModes.item2Title"), description: t("positionPaper.failureModes.item2Desc") },
                { number: 3, title: t("positionPaper.failureModes.item3Title"), description: t("positionPaper.failureModes.item3Desc") },
                { number: 4, title: t("positionPaper.failureModes.item4Title"), description: t("positionPaper.failureModes.item4Desc") },
                { number: 5, title: t("positionPaper.failureModes.item5Title"), description: t("positionPaper.failureModes.item5Desc") },
              ]}
            />
          </div>
        </section>
      </ScrollRevealSection>

      {/* 7. Talent challenge */}
      <ScrollRevealSection delay={100}>
        <section className="py-12 border-b border-border" aria-labelledby="talent-heading">
          <SectionHead
            label={t("positionPaper.talent.eyebrow")}
            heading={t("positionPaper.talent.heading")}
          />
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>{t("positionPaper.talent.para1")}</p>
              <p>{t("positionPaper.talent.para2")}</p>
              <p>{t("positionPaper.talent.para3")}</p>
              <div className="mt-4">
                <StatCallout
                  value={t("positionPaper.talent.statValue")}
                  label={t("positionPaper.talent.statLabel")}
                  variant="accent"
                />
              </div>
            </div>
            <div className="space-y-6">
              <PullQuote attribution={t("positionPaper.talent.quote1Attribution")} wide>
                {t("positionPaper.talent.quote1Text")}
              </PullQuote>
              <PullQuote attribution={t("positionPaper.talent.quote2Attribution")} wide>
                {t("positionPaper.talent.quote2Text")}
              </PullQuote>
            </div>
          </div>
        </section>
      </ScrollRevealSection>

      {/* 8. Comparison grid */}
      <ScrollRevealSection delay={100}>
        <section className="py-12 border-b border-border" aria-labelledby="comparison-heading">
          <SectionHead
            label={t("positionPaper.comparison.eyebrow")}
            heading={t("positionPaper.comparison.heading")}
          />
          <div className="mt-8">
            <ComparisonGrid
              leftHeading={t("positionPaper.comparison.leftHeading")}
              rightHeading={t("positionPaper.comparison.rightHeading")}
              highlightRight
              rows={[
                { label: t("positionPaper.comparison.row1Label"), left: t("positionPaper.comparison.row1Left"), right: t("positionPaper.comparison.row1Right") },
                { label: t("positionPaper.comparison.row2Label"), left: t("positionPaper.comparison.row2Left"), right: t("positionPaper.comparison.row2Right") },
                { label: t("positionPaper.comparison.row3Label"), left: t("positionPaper.comparison.row3Left"), right: t("positionPaper.comparison.row3Right") },
                { label: t("positionPaper.comparison.row4Label"), left: t("positionPaper.comparison.row4Left"), right: t("positionPaper.comparison.row4Right") },
                { label: t("positionPaper.comparison.row5Label"), left: t("positionPaper.comparison.row5Left"), right: t("positionPaper.comparison.row5Right") },
                { label: t("positionPaper.comparison.row6Label"), left: t("positionPaper.comparison.row6Left"), right: t("positionPaper.comparison.row6Right") },
                { label: t("positionPaper.comparison.row7Label"), left: t("positionPaper.comparison.row7Left"), right: t("positionPaper.comparison.row7Right") },
                { label: t("positionPaper.comparison.row8Label"), left: t("positionPaper.comparison.row8Left"), right: t("positionPaper.comparison.row8Right") },
              ]}
            />
          </div>
        </section>
      </ScrollRevealSection>

      {/* 9. Case study cards × 3 */}
      <ScrollRevealSection delay={100}>
        <section className="py-12 border-b border-border" aria-labelledby="case-studies-heading">
          <SectionHead
            label={t("positionPaper.caseStudies.eyebrow")}
            heading={t("positionPaper.caseStudies.heading")}
          />
          <div className="mt-8 space-y-8">
            <CaseStudyCard
              title={t("positionPaper.caseStudies.ilmTitle")}
              stat={{ value: t("positionPaper.caseStudies.ilmStat"), label: t("positionPaper.caseStudies.ilmStatLabel") }}
              quote={{ text: t("positionPaper.caseStudies.ilmQuoteText"), attribution: t("positionPaper.caseStudies.ilmQuoteAttribution") }}
            >
              {t("positionPaper.caseStudies.ilmBody")}
            </CaseStudyCard>
            <CaseStudyCard
              title={t("positionPaper.caseStudies.nepTitle")}
              stat={{ value: t("positionPaper.caseStudies.nepStat"), label: t("positionPaper.caseStudies.nepStatLabel") }}
              quote={{ text: t("positionPaper.caseStudies.nepQuoteText"), attribution: t("positionPaper.caseStudies.nepQuoteAttribution") }}
            >
              {t("positionPaper.caseStudies.nepBody")}
            </CaseStudyCard>
            <CaseStudyCard
              title={t("positionPaper.caseStudies.vrTitle")}
              imageSrc={techMedia?.darkSrc}
              imageAlt={techMedia?.alt}
              stat={{ value: t("positionPaper.caseStudies.vrStat"), label: t("positionPaper.caseStudies.vrStatLabel") }}
            >
              {t("positionPaper.caseStudies.vrBody")}
            </CaseStudyCard>

          </div>
        </section>
      </ScrollRevealSection>

      {/* 10. Production City's 6 integrated components */}
      <ScrollRevealSection delay={100}>
        <section className="py-12 border-b border-border" aria-labelledby="model-heading">
          <SectionHead
            label={t("positionPaper.model.eyebrow")}
            heading={t("positionPaper.model.heading")}
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <div key={n} className="border border-border rounded-sm p-5">
                <p className="text-xs font-mono text-muted-foreground mb-2">{`0${n}`}</p>
                <h3 className="text-sm font-semibold text-foreground">
                  {t(`positionPaper.model.component${n}Title` as Parameters<typeof t>[0])}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {t(`positionPaper.model.component${n}Desc` as Parameters<typeof t>[0])}
                </p>
              </div>
            ))}
          </div>
        </section>
      </ScrollRevealSection>

      {/* 11. Conclusion: four statement cards */}
      <ScrollRevealSection delay={100}>
        <section className="py-12 border-b border-border" aria-labelledby="conclusion-heading">
          <SectionHead
            label={t("positionPaper.conclusion.eyebrow")}
            heading={t("positionPaper.conclusion.heading")}
          />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="border border-border rounded-sm p-5">
                <p className="text-xs font-mono text-muted-foreground mb-3">{`0${n}`}</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {t(`positionPaper.conclusion.card${n}` as Parameters<typeof t>[0])}
                </p>
              </div>
            ))}
          </div>
        </section>
      </ScrollRevealSection>

      {/* 12. Five evaluation criteria */}
      <ScrollRevealSection delay={100}>
        <section className="py-12 border-b border-border" aria-labelledby="evaluation-heading">
          <SectionHead
            label={t("positionPaper.evaluation.eyebrow")}
            heading={t("positionPaper.evaluation.heading")}
          />
          <ol className="mt-8 space-y-4">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <li key={n} className="flex gap-4">
                <span className="text-xs font-mono text-muted-foreground mt-0.5 shrink-0">{`0${n}`}</span>
                <p className="text-sm text-foreground">
                  {t(`positionPaper.evaluation.criterion${n}` as Parameters<typeof t>[0])}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </ScrollRevealSection>

      {/* 13. EOI section */}
      <div id="eoi-section" className="border-t border-border">
        <EOISection
          heading={t("positionPaper.eoi.heading")}
          contextText={t("positionPaper.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory="investor"
          onSubmit={handleEoiSubmit}
        />
      </div>

      {/* 14. Forward-looking disclaimer */}
      <ForwardLookingDisclaimer text={t("positionPaper.disclaimer.forwardLooking")} />
    </LandingPageTemplate>
  );
}
