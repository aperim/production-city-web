"use client";

import { useEffect, useState } from "react";
import { ErrorBoundary } from "../error-boundary";
import { AnnouncementsPage } from "../pages/announcements";
import { AnnouncementDetailPage } from "../pages/announcement-detail";
import { AuthProvider } from "../lib/auth-context";

/**
 * Parse the URL pathname to extract slug or category filter.
 * Handles locale-prefixed and non-prefixed paths.
 */
function parseAnnouncementsPath(pathname: string): {
  mode: "list" | "detail" | "category";
  slug?: string;
  category?: string;
} {
  // Strip locale prefix if present (e.g., /es/announcements → /announcements)
  const cleaned = pathname.replace(/^\/[a-z]{2}(?=\/announcements)/, "");

  // /announcements/categories/:slug
  const catMatch = cleaned.match(/^\/announcements\/categories\/([^/]+)\/?$/);
  if (catMatch) {
    return { mode: "category", category: catMatch[1] };
  }

  // /announcements/:slug (but not /announcements/categories)
  const slugMatch = cleaned.match(/^\/announcements\/([^/]+)\/?$/);
  if (slugMatch && slugMatch[1] !== "categories") {
    return { mode: "detail", slug: slugMatch[1] };
  }

  // /announcements
  return { mode: "list" };
}

function AnnouncementsRouter() {
  const [route, setRoute] = useState<ReturnType<typeof parseAnnouncementsPath>>({ mode: "list" });

  useEffect(() => {
    setRoute(parseAnnouncementsPath(window.location.pathname));

    // Listen for popstate (back/forward) to update view
    const onPopState = () => {
      setRoute(parseAnnouncementsPath(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (route.mode === "detail" && route.slug) {
    return (
      <AuthProvider>
        <AnnouncementDetailPage slug={route.slug} />
      </AuthProvider>
    );
  }

  return <AnnouncementsPage initialCategory={route.category} />;
}

export default function AnnouncementsClient() {
  return (
    <ErrorBoundary>
      <AnnouncementsRouter />
    </ErrorBoundary>
  );
}
