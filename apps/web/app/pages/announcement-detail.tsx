/**
 * Announcement detail page component.
 * Route: /announcements/:slug and /:locale/announcements/:slug
 *
 * Displays a single published announcement with content blocks, SEO,
 * and subscription CTAs for authenticated users.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AnnouncementDetail,
  LandingPageTemplate,
  type ContentBlock,
} from "@productioncity/holding-ui";
import { I18nProvider, useTranslation } from "../i18n/context";
import type { SupportedLocale } from "../i18n/index.js";
import { useLandingNav, useLandingFooter } from "../lib/use-landing-layout";
import { useAuth } from "../lib/auth-context";
import {
  getAnnouncement,
  listMySubscriptions,
  createSubscription,
  type PublicAnnouncement,
} from "../lib/api-client";
import { AnnouncementDetailStructuredData } from "../lib/structured-data";

interface AnnouncementDetailPageContentProps {
  slug: string;
}

function AnnouncementDetailPageContent({ slug }: AnnouncementDetailPageContentProps) {
  const { t, locale } = useTranslation();
  const nav = useLandingNav();
  const footer = useLandingFooter();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [announcement, setAnnouncement] = useState<PublicAnnouncement | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [subscribedCategories, setSubscribedCategories] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Fetch announcement
  useEffect(() => {
    setLoading(true);
    getAnnouncement(slug).then((result) => {
      if (result.ok) {
        setAnnouncement(result.data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }).catch(() => {
      setNotFound(true);
      setLoading(false);
    });
  }, [slug]);

  // Fetch user's subscriptions if authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      listMySubscriptions().then((result) => {
        if (result.ok) {
          const catIds = new Set(
            result.data.subscriptions
              .filter((s) => s.status === "confirmed" || s.status === "pending")
              .map((s) => s.category.id),
          );
          setSubscribedCategories(catIds);
        }
      });
    }
  }, [isAuthenticated, authLoading]);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleSubscribe = useCallback(async (categoryId: string) => {
    const result = await createSubscription(categoryId, ["email"]);
    if (result.ok) {
      setSubscribedCategories((prev) => new Set([...prev, categoryId]));
    }
  }, []);

  if (loading) {
    return (
      <LandingPageTemplate nav={nav} footer={footer}>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="animate-pulse">
            <div className="h-8 w-3/4 rounded bg-muted mb-4" />
            <div className="h-4 w-full rounded bg-muted mb-2" />
            <div className="h-4 w-2/3 rounded bg-muted mb-8" />
            <div className="h-4 w-full rounded bg-muted mb-2" />
            <div className="h-4 w-full rounded bg-muted mb-2" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        </div>
      </LandingPageTemplate>
    );
  }

  if (notFound || !announcement) {
    return (
      <LandingPageTemplate nav={nav} footer={footer}>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 text-center">
          <h1 id="announcement-detail-heading" className="text-xl font-semibold text-foreground mb-2">{t("announcements.detail.not_found")}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {t("announcements.detail.not_found_description")}
          </p>
          <a
            href={`${prefix}/announcements`}
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            {t("announcements.detail.back")}
          </a>
        </div>
      </LandingPageTemplate>
    );
  }

  const primaryCategory = announcement.categories[0];
  const isSubscribed = primaryCategory
    ? subscribedCategories.has(primaryCategory.id)
    : false;

  return (
    <LandingPageTemplate nav={nav} footer={footer}>
      <AnnouncementDetailStructuredData
        title={announcement.title}
        summary={announcement.summary}
        authorName={announcement.author.name ?? "Production City"}
        publishedAt={announcement.publishedAt ?? ""}
        lastEditedAt={announcement.lastEditedAt}
        slug={announcement.slug}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Back link */}
        <a
          href={`${prefix}/announcements`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors duration-150"
        >
          &larr; {t("announcements.detail.back")}
        </a>

        {/* Subscription banner */}
        {isAuthenticated && primaryCategory && (
          <div className="mb-6">
            {isSubscribed ? (
              <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
                {t("announcements.detail.subscribed_banner", { categoryName: primaryCategory.name })}
              </div>
            ) : (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
                <p className="text-sm text-foreground">
                  {t("announcements.detail.subscribe_cta", { categoryName: primaryCategory.name })}
                </p>
                <button
                  type="button"
                  onClick={() => handleSubscribe(primaryCategory.id)}
                  className="rounded-md border border-primary/50 bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors duration-150"
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>
        )}

        {/* Share button */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleShare}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            {copied ? t("announcements.detail.share_copied") : t("announcements.detail.share")}
          </button>
        </div>

        {/* Announcement content */}
        <AnnouncementDetail
          title={announcement.title}
          summary={announcement.summary}
          contentBlocks={announcement.contentBlocks as ContentBlock[]}
          categories={announcement.categories}
          tags={announcement.tags}
          author={{ name: announcement.author.name ?? "Production City" }}
          publishedAt={announcement.publishedAt ?? ""}
          lastEditedAt={announcement.lastEditedAt}
        />
      </div>

    </LandingPageTemplate>
  );
}

interface AnnouncementDetailPageProps {
  slug: string;
  serverLocale?: SupportedLocale;
}

export function AnnouncementDetailPage({ slug, serverLocale }: AnnouncementDetailPageProps) {
  return (
    <I18nProvider serverLocale={serverLocale}>
      <AnnouncementDetailPageContent slug={slug} />
    </I18nProvider>
  );
}
