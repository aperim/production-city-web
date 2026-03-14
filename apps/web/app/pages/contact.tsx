/**
 * Contact & EOI page component — contact info and expression of interest form.
 * Supports URL ?category= param for pre-selecting EOI category.
 * All text from i18n, all content pre-groundbreaking (future tense).
 */

"use client";

import { useState, useEffect } from "react";
import {
  LandingPageTemplate,
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

const VALID_CATEGORIES = new Set([
  "general",
  "producer",
  "creative",
  "partner",
  "investor",
  "education",
  "employment",
]);

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

export function ContactPage() {
  return (
    <I18nProvider>
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

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* 1. Introduction */}
      <section className="py-12 sm:py-16" aria-labelledby="contact-heading">
        <h1 id="contact-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
          {t("contact.heading")}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          {t("contact.intro")}
        </p>
      </section>

      {/* 2. Contact Information */}
      <section className="py-8" aria-labelledby="contact-info-heading">
        <h2 id="contact-info-heading" className="text-xl font-semibold text-foreground">
          {t("contact.info.heading")}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="border border-border rounded-md p-4">
            <p className="text-sm font-semibold text-foreground">
              {t("contact.info.email")}
            </p>
            <a
              href="mailto:troy@team.production.city"
              className="text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
            >
              {t("contact.info.emailAddress")}
            </a>
          </div>
          <div className="border border-border rounded-md p-4">
            <p className="text-sm font-semibold text-foreground">
              {t("contact.info.website")}
            </p>
            <a
              href="https://www.production.city"
              className="text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
            >
              {t("contact.info.websiteUrl")}
            </a>
          </div>
          <div className="border border-border rounded-md p-4">
            <p className="text-sm font-semibold text-foreground">
              {t("contact.info.phoneAU")}
            </p>
            <a
              href="tel:+61291379100"
              className="text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
            >
              {t("contact.info.phoneAUNumber")}
            </a>
          </div>
          <div className="border border-border rounded-md p-4">
            <p className="text-sm font-semibold text-foreground">
              {t("contact.info.phoneUS")}
            </p>
            <a
              href="tel:+16502156253"
              className="text-sm text-muted-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground"
            >
              {t("contact.info.phoneUSNumber")}
            </a>
          </div>
        </div>
      </section>

      {/* 3. Acknowledgement of Country */}
      <section className="border-t border-border py-8" aria-labelledby="contact-acknowledgement-heading">
        <h2 id="contact-acknowledgement-heading" className="text-sm font-semibold text-foreground">
          {t("contact.acknowledgement.heading")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("footer.acknowledgement")}
        </p>
      </section>

      {/* 4. EOI Form — key forces re-mount when URL category changes */}
      <div id="eoi-section">
        <EOISection
          key={defaultCategory}
          heading={t("contact.eoi.heading")}
          contextText={t("contact.eoi.context")}
          formLabels={eoiLabels}
          categories={eoiCategories}
          defaultCategory={defaultCategory}
          onSubmit={handleEoiSubmit}
        />
      </div>
    </LandingPageTemplate>
  );
}
