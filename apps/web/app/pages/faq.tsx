/**
 * FAQ page — categorized, searchable FAQ with hero media.
 * Client-side search with debouncing, a11y, XSS-safe highlighting.
 * Schema.org FAQPage structured data.
 * All text from i18n.
 */

"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  LandingPageTemplate,
  MediaHero,
  FAQSection,
} from "@productioncity/holding-ui";
import type { TranslationKey } from "../i18n/index";
import { I18nProvider, useTranslation } from "../i18n/context";
import {
  useLandingNav,
  useLandingFooter,
} from "../lib/use-landing-layout";
import { MEDIA } from "../lib/media-config";

interface FAQEntry {
  question: string;
  answer: string;
  /** The translated category label (for display). */
  category: string;
  /** The internal category key (locale-independent, for filtering). */
  categoryKey: string;
}

const FAQ_COUNT = 20;
const MAX_SEARCH_LENGTH = 200;
const DEBOUNCE_MS = 300;

/**
 * Category keys used as internal identifiers.
 * These map to i18n keys like `faq.categoryFacilities`, `faq.categoryServices`, etc.
 * FAQ entries store translated category strings; we match them via a reverse lookup.
 */
const CATEGORY_KEYS = ["Facilities", "Services", "Global", "Community", "Engagement"] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

/** Map from i18n translation key suffix to the category key. */
const CATEGORY_I18N_MAP: Record<CategoryKey, TranslationKey> = {
  Facilities: "faq.categoryFacilities" as TranslationKey,
  Services: "faq.categoryServices" as TranslationKey,
  Global: "faq.categoryGlobal" as TranslationKey,
  Community: "faq.categoryCommunity" as TranslationKey,
  Engagement: "faq.categoryEngagement" as TranslationKey,
};

/** Build the list of FAQ entries from i18n keys. */
function useFaqEntries(): FAQEntry[] {
  const { t } = useTranslation();

  return useMemo(() => {
    // Build reverse lookup: translated category label → internal key
    const translatedToKey = new Map<string, CategoryKey>();
    for (const key of CATEGORY_KEYS) {
      translatedToKey.set(t(CATEGORY_I18N_MAP[key]), key);
    }

    const entries: FAQEntry[] = [];
    for (let i = 1; i <= FAQ_COUNT; i++) {
      const translatedCategory = t(`faq.c${i}` as TranslationKey);
      entries.push({
        question: t(`faq.q${i}` as TranslationKey),
        answer: t(`faq.a${i}` as TranslationKey),
        category: translatedCategory,
        categoryKey: translatedToKey.get(translatedCategory) ?? translatedCategory,
      });
    }
    return entries;
  }, [t]);
}

/** Debounce hook */
function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/**
 * XSS-safe Schema.org FAQPage structured data.
 * Uses DOM textContent assignment to safely serialize, avoiding innerHTML XSS.
 */
function FAQStructuredData({ entries }: { entries: FAQEntry[] }) {
  const scriptRef = useRef<HTMLScriptElement>(null);

  useEffect(() => {
    if (!scriptRef.current) return;
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: entries.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: entry.answer,
        },
      })),
    };
    scriptRef.current.textContent = JSON.stringify(structuredData);
  }, [entries]);

  return <script ref={scriptRef} type="application/ld+json" />;
}

export function FAQPage() {
  return (
    <I18nProvider>
      <FAQPageContent />
    </I18nProvider>
  );
}

function FAQPageContent() {
  const { t } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const allEntries = useFaqEntries();
  const heroMedia = MEDIA["faq-hero"];

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, DEBOUNCE_MS);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultCountRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Reject queries longer than MAX_SEARCH_LENGTH
    if (value.length <= MAX_SEARCH_LENGTH) {
      setSearchQuery(value);
    }
  }, []);

  const filteredEntries = useMemo(() => {
    let entries = allEntries;
    if (activeCategory) {
      entries = entries.filter((e) => e.categoryKey === activeCategory);
    }
    if (debouncedQuery.trim()) {
      // Plain substring matching only — no regex execution (security)
      const q = debouncedQuery.trim().toLowerCase();
      entries = entries.filter(
        (e) =>
          e.question.toLowerCase().includes(q) ||
          e.answer.toLowerCase().includes(q),
      );
    }
    return entries;
  }, [allEntries, activeCategory, debouncedQuery]);

  const locale = useTranslation().locale;
  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* Schema.org structured data */}
      <FAQStructuredData entries={allEntries} />

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
              {t("faq.heading")}
            </h1>
          </div>
        </MediaHero>
      )}

      {/* Search — plain substring matching, debounced, max length */}
      <div className="py-6">
        <label htmlFor="faq-search" className="sr-only">
          {t("faq.searchPlaceholder")}
        </label>
        <input
          id="faq-search"
          ref={searchInputRef}
          type="search"
          value={searchQuery}
          onChange={handleSearchChange}
          maxLength={MAX_SEARCH_LENGTH}
          placeholder={t("faq.searchPlaceholder")}
          aria-label={t("faq.searchPlaceholder")}
          aria-describedby="faq-search-count"
          className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {/* Announce result count for screen readers */}
        <div
          id="faq-search-count"
          ref={resultCountRef}
          className="mt-2 text-xs text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {debouncedQuery.trim()
            ? t((filteredEntries.length === 1 ? "faq.resultCountSingular" : "faq.resultCountPlural") as TranslationKey, { count: filteredEntries.length })
            : t("faq.questionCount" as TranslationKey, { count: filteredEntries.length })}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 pb-8" role="group" aria-label={t("faq.categoriesLabel")}>
        <button
          aria-pressed={activeCategory === null}
          onClick={() => setActiveCategory(null)}
          className={`rounded-sm border px-3 py-1.5 text-sm transition-colors duration-150 ${
            activeCategory === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground hover:bg-muted"
          }`}
        >
          {t("faq.allCategories")}
        </button>
        {CATEGORY_KEYS.map((cat) => (
          <button
            key={cat}
            aria-pressed={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-sm border px-3 py-1.5 text-sm transition-colors duration-150 ${
              activeCategory === cat
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            {t(CATEGORY_I18N_MAP[cat])}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      {filteredEntries.length > 0 ? (
        <FAQSection
          heading={t("faq.questionsHeading")}
          items={filteredEntries.map((e) => ({
            question: e.question,
            answer: e.answer,
          }))}
          searchPlaceholder=""
        />
      ) : (
        <p className="py-8 text-sm text-muted-foreground">
          {t("faq.noResults")}
        </p>
      )}

      {/* CTA to contact */}
      <section className="py-8 border-t border-border text-center" aria-labelledby="faq-cta-heading">
        <h2 id="faq-cta-heading" className="text-base font-semibold text-foreground">
          {t("faq.cantFindHeading")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("faq.cantFindDescription")}
        </p>
        <a
          href={`${prefix}/contact`}
          className="mt-4 inline-flex items-center justify-center rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
        >
          {t("faq.cantFindCta")}
        </a>
      </section>
    </LandingPageTemplate>
  );
}
