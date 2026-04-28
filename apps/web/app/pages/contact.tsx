/**
 * Contact & EOI page — persona quick-select with dynamic form fields.
 * Hero with media. Supports URL ?category= param for pre-selecting.
 * All text from i18n.
 */

"use client";

import { useState, useEffect } from "react";
import {
  LandingPageTemplate,
  MediaHero,
  EOISection,
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
import { ContactStructuredData, DublinCoreMeta } from "../lib/structured-data";

const VALID_CATEGORIES = new Set([
  "general",
  "producer",
  "creative",
  "partner",
  "investor",
  "education",
  "employment",
]);

type PersonaKey = "producer" | "investor" | "creative" | "partner" | "education" | "employment" | "general";

const PERSONA_KEYS: PersonaKey[] = [
  "producer",
  "investor",
  "creative",
  "partner",
  "education",
  "employment",
  "general",
];

/** Read ?category= from URL search params after hydration. */
function useDefaultCategory(): string {
  const [category, setCategory] = useState("general");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat && VALID_CATEGORIES.has(cat)) {
      setCategory(cat);
    }
  }, []);

  return category;
}


interface ContactPageProps {
  serverLocale?: SupportedLocale;
}

export function ContactPage({ serverLocale }: ContactPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <ContactPageContent />
    </I18nProvider>
  );
}

function ContactPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const eoiLabels = useEoiLabels();
  const eoiCategories = useEoiCategories();
  const handleEoiSubmit = useEoiSubmit();
  const defaultCategory = useDefaultCategory();
  const [selectedPersona, setSelectedPersona] = useState<string>(defaultCategory);
  const heroMedia = MEDIA["contact-hero"];

  // Sync when URL category changes
  useEffect(() => {
    setSelectedPersona(defaultCategory);
  }, [defaultCategory]);

  const handlePersonaSelect = (persona: string) => {
    setSelectedPersona(persona);
    // Focus the EOI section after selection
    const eoiEl = document.getElementById("eoi-section");
    if (eoiEl) {
      eoiEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <ContactStructuredData />
      <DublinCoreMeta
        title="Contact — Production City"
        description="Get in touch with Production City — enquiries for producers, investors, creatives, partners, education, employment, and general information."
        subject="contact, enquiry, screen production, Australia"
        type="InteractiveResource"
        path="/contact"
        date="2026-04-27"
      />
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
          className="max-h-[40vh] -mx-4 sm:-mx-6"
        >
          <div className="pb-6">
            <h1 id="page-heading" className="text-2xl font-semibold text-white sm:text-3xl">
              {t("contact.heading")}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-white/90">
              {t("contact.intro")}
            </p>
          </div>
        </MediaHero>
      )}

      {/* Persona Quick-Select */}
      <section className="py-10" aria-labelledby="persona-select-heading">
        <h2 id="persona-select-heading" className="text-xl font-semibold text-foreground">
          {t("contact.personaSelect.title")}
        </h2>
        <div
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          role="radiogroup"
          aria-label={t("contact.personaSelect.title")}
        >
          {PERSONA_KEYS.map((key, idx) => {
            const isSelected = selectedPersona === key;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handlePersonaSelect(key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePersonaSelect(key);
                  } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    e.preventDefault();
                    const nextIdx = (idx + 1) % PERSONA_KEYS.length;
                    const next = PERSONA_KEYS[nextIdx] ?? PERSONA_KEYS[0]!;
                    handlePersonaSelect(next);
                    const nextEl = e.currentTarget.parentElement?.children[nextIdx] as HTMLElement | undefined;
                    nextEl?.focus();
                  } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const prevIdx = (idx - 1 + PERSONA_KEYS.length) % PERSONA_KEYS.length;
                    const prev = PERSONA_KEYS[prevIdx] ?? PERSONA_KEYS[0]!;
                    handlePersonaSelect(prev);
                    const prevEl = e.currentTarget.parentElement?.children[prevIdx] as HTMLElement | undefined;
                    prevEl?.focus();
                  }
                }}
                className={`flex flex-col items-start rounded-sm border p-4 text-left transition-colors duration-150 min-h-[44px] ${
                  isSelected
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-sm font-medium">
                  {t(`contact.personaSelect.${key}` as Parameters<typeof t>[0])}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {t(`contact.personaSelect.${key}Desc` as Parameters<typeof t>[0])}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-8 border-t border-border" aria-labelledby="contact-info-heading">
        <h2 id="contact-info-heading" className="text-xl font-semibold text-foreground">
          {t("contact.info.heading")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-border rounded-sm p-4">
            <p className="text-sm font-semibold text-foreground">
              {t("contact.info.email")}
            </p>
            <a
              href="mailto:troy@team.production.city"
              className="text-sm text-primary underline underline-offset-4 transition-colors duration-150 hover:text-primary/80"
            >
              {t("contact.info.emailAddress")}
            </a>
          </div>
          <div className="border border-border rounded-sm p-4">
            <p className="text-sm font-semibold text-foreground">
              {t("contact.info.website")}
            </p>
            <a
              href="https://www.production.city"
              className="text-sm text-primary underline underline-offset-4 transition-colors duration-150 hover:text-primary/80"
            >
              {t("contact.info.websiteUrl")}
            </a>
          </div>
          <div className="border border-border rounded-sm p-4">
            <p className="text-sm font-semibold text-foreground">
              {t("contact.info.phoneAU")}
            </p>
            <a
              href="tel:+61291379100"
              className="text-sm text-primary underline underline-offset-4 transition-colors duration-150 hover:text-primary/80"
            >
              {t("contact.info.phoneAUNumber")}
            </a>
          </div>
          <div className="border border-border rounded-sm p-4">
            <p className="text-sm font-semibold text-foreground">
              {t("contact.info.phoneUS")}
            </p>
            <a
              href="tel:+16502156253"
              className="text-sm text-primary underline underline-offset-4 transition-colors duration-150 hover:text-primary/80"
            >
              {t("contact.info.phoneUSNumber")}
            </a>
          </div>
        </div>
      </section>

      {/* EOI Form — dynamic based on persona selection */}
      <div id="eoi-section" aria-live="polite">
        <EOISection
          key={selectedPersona}
          heading={t("contact.eoi.heading")}
          contextText={t("contact.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory={selectedPersona}
          onSubmit={handleEoiSubmit}
        />
      </div>
    </LandingPageTemplate>
  );
}
