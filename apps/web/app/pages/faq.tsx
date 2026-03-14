/**
 * FAQ page component — frequently asked questions with category filtering and search.
 * Includes Schema.org FAQPage structured data.
 * All text from i18n, all content pre-groundbreaking (future tense).
 */

"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  LandingPageTemplate,
  FAQSection,
} from "@productioncity/holding-ui";
import type { TranslationKey } from "../i18n/index";
import { I18nProvider, useTranslation } from "../i18n/context";
import {
  useLandingNav,
  useLandingFooter,
} from "../lib/use-landing-layout";

interface FAQEntry {
  question: string;
  answer: string;
  category: string;
}

const FAQ_COUNT = 20;
const CATEGORIES = ["Facilities", "Services", "Global", "Community", "Engagement"] as const;

/** Build the list of FAQ entries from i18n keys. */
function useFaqEntries(): FAQEntry[] {
  const { t } = useTranslation();

  return useMemo(() => {
    const entries: FAQEntry[] = [];
    for (let i = 1; i <= FAQ_COUNT; i++) {
      entries.push({
        question: t(`faq.q${i}` as TranslationKey),
        answer: t(`faq.a${i}` as TranslationKey),
        category: t(`faq.c${i}` as TranslationKey),
      });
    }
    return entries;
  }, [t]);
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

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = useMemo(() => {
    let entries = allEntries;
    if (activeCategory) {
      entries = entries.filter((e) => e.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      entries = entries.filter(
        (e) =>
          e.question.toLowerCase().includes(q) ||
          e.answer.toLowerCase().includes(q),
      );
    }
    return entries;
  }, [allEntries, activeCategory, searchQuery]);

  const categoryLabels: Record<string, string> = {
    Facilities: t("faq.categoryFacilities"),
    Services: t("faq.categoryServices"),
    Global: t("faq.categoryGlobal"),
    Community: t("faq.categoryCommunity"),
    Engagement: t("faq.categoryEngagement"),
  };

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      {/* Schema.org structured data */}
      <FAQStructuredData entries={allEntries} />

      {/* 1. Heading */}
      <section className="py-12 sm:py-16" aria-labelledby="faq-heading">
        <h1 id="faq-heading" className="text-2xl font-semibold text-foreground sm:text-3xl">
          {t("faq.heading")}
        </h1>
      </section>

      {/* 2. Search */}
      <div className="pb-4">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("faq.searchPlaceholder")}
          aria-label={t("faq.searchPlaceholder")}
          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* 3. Category Filters */}
      <div className="flex flex-wrap gap-2 pb-8" role="group" aria-label={t("faq.categoriesLabel")}>
        <button
          aria-pressed={activeCategory === null}
          onClick={() => setActiveCategory(null)}
          className={`rounded-sm border px-3 py-1 text-sm transition-colors duration-150 ${
            activeCategory === null
              ? "border-foreground bg-foreground text-background"
              : "border-border text-foreground hover:bg-muted"
          }`}
        >
          {t("faq.allCategories")}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            aria-pressed={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-sm border px-3 py-1 text-sm transition-colors duration-150 ${
              activeCategory === cat
                ? "border-foreground bg-foreground text-background"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* 4. FAQ List */}
      {filteredEntries.length > 0 ? (
        <FAQSection
          heading=""
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
    </LandingPageTemplate>
  );
}
