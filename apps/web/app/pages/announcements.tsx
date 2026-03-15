/**
 * Announcements listing page component.
 * Route: /announcements and /:locale/announcements
 * Route: /announcements/categories/:slug
 *
 * Displays published announcements with category filtering, pagination,
 * and skeleton loading states.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnnouncementList,
  LandingPageTemplate,
  type AnnouncementSummary,
  type Category,
  type PaginationState,
  type AnnouncementVisibility,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import { useLandingNav, useLandingFooter } from "../lib/use-landing-layout";
import {
  listAnnouncements,
  listCategories,
  type PublicAnnouncement,
} from "../lib/api-client";

/** Map API announcement to UI AnnouncementSummary. */
function toSummary(a: PublicAnnouncement): AnnouncementSummary {
  return {
    id: a.id,
    title: a.title,
    summary: a.summary,
    slug: a.slug,
    categories: a.categories,
    tags: a.tags,
    author: { name: a.author.name ?? "Production City" },
    publishedAt: a.publishedAt ?? "",
    visibility: a.visibility as AnnouncementVisibility,
  };
}

interface AnnouncementsPageContentProps {
  /** Initial category slug filter (from URL). */
  initialCategory?: string;
}

function AnnouncementsPageContent({ initialCategory }: AnnouncementsPageContentProps) {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory ?? null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  // Fetch categories once
  useEffect(() => {
    listCategories().then((result) => {
      if (result.ok) {
        setCategories(result.data.categories);
      }
    });
  }, []);

  // Fetch announcements when page or category changes
  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await listAnnouncements({
        page,
        pageSize: 12,
        category: activeCategory ?? undefined,
      });
      if (result.ok) {
        setAnnouncements(result.data.announcements.map(toSummary));
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError(result.error.message);
      }
    } catch {
      setError("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCategoryFilter = useCallback((slug: string | null) => {
    setActiveCategory(slug);
    setPage(1);
    // Update URL without full navigation
    if (typeof window !== "undefined") {
      const newPath = slug
        ? `${prefix}/announcements/categories/${slug}`
        : `${prefix}/announcements`;
      window.history.pushState(null, "", newPath);
    }
  }, [prefix]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    // Scroll to top of content
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const pagination: PaginationState = {
    page,
    totalPages,
    onPageChange: handlePageChange,
  };

  // Make cards clickable
  const handleCardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = (e.target as HTMLElement).closest("[data-slug]");
    if (card) {
      const slug = card.getAttribute("data-slug");
      if (slug) {
        window.location.href = `${prefix}/announcements/${slug}`;
      }
    }
  }, [prefix]);

  // SEO structured data — static content, no user input (safe for inline script)
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Updates — Production City",
    description: "Latest news and updates from Production City",
    url: `https://production.city${prefix}/announcements`,
  });

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page header */}
        <header className="mb-8">
          <h1 id="announcements-heading" className="text-2xl font-bold text-foreground">
            {t("announcements.page.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("announcements.page.description")}
          </p>
        </header>

        {/* Announcement list with filtering and pagination */}
        <div role="presentation" onClick={handleCardClick}>
          <AnnouncementList
            announcements={announcements}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryFilter={handleCategoryFilter}
            pagination={pagination}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      {/* SEO: CollectionPage structured data — static content only, no user input */}
      <script type="application/ld+json">{structuredData}</script>
    </LandingPageTemplate>
  );
}

export function AnnouncementsPage({ initialCategory }: { initialCategory?: string }) {
  return (
    <I18nProvider>
      <AnnouncementsPageContent initialCategory={initialCategory} />
    </I18nProvider>
  );
}
