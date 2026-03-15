/**
 * Tests for announcement page URL routing logic.
 * @see Issue #292
 */

import { describe, it, expect } from "vitest";

/**
 * Parse the URL pathname to extract slug or category filter.
 * Extracted from announcements/page.tsx for unit testing.
 */
function parseAnnouncementsPath(pathname: string): {
  mode: "list" | "detail" | "category";
  slug?: string;
  category?: string;
} {
  const cleaned = pathname.replace(/^\/[a-z]{2}(?=\/announcements)/, "");

  const catMatch = cleaned.match(/^\/announcements\/categories\/([^/]+)\/?$/);
  if (catMatch) {
    return { mode: "category", category: catMatch[1] };
  }

  const slugMatch = cleaned.match(/^\/announcements\/([^/]+)\/?$/);
  if (slugMatch && slugMatch[1] !== "categories") {
    return { mode: "detail", slug: slugMatch[1] };
  }

  return { mode: "list" };
}

describe("parseAnnouncementsPath", () => {
  it("returns list mode for /announcements", () => {
    expect(parseAnnouncementsPath("/announcements")).toEqual({ mode: "list" });
  });

  it("returns list mode for /announcements/", () => {
    expect(parseAnnouncementsPath("/announcements/")).toEqual({ mode: "list" });
  });

  it("returns detail mode with slug for /announcements/:slug", () => {
    expect(parseAnnouncementsPath("/announcements/hello-world")).toEqual({
      mode: "detail",
      slug: "hello-world",
    });
  });

  it("returns detail mode with trailing slash", () => {
    expect(parseAnnouncementsPath("/announcements/hello-world/")).toEqual({
      mode: "detail",
      slug: "hello-world",
    });
  });

  it("returns category mode for /announcements/categories/:slug", () => {
    expect(parseAnnouncementsPath("/announcements/categories/news")).toEqual({
      mode: "category",
      category: "news",
    });
  });

  it("handles locale-prefixed paths", () => {
    expect(parseAnnouncementsPath("/es/announcements")).toEqual({ mode: "list" });
    expect(parseAnnouncementsPath("/es/announcements/hello")).toEqual({
      mode: "detail",
      slug: "hello",
    });
    expect(parseAnnouncementsPath("/zh/announcements/categories/news")).toEqual({
      mode: "category",
      category: "news",
    });
  });

  it("does not strip non-locale prefixes", () => {
    // 3+ char prefixes shouldn't be stripped
    expect(parseAnnouncementsPath("/abc/announcements")).toEqual({ mode: "list" });
  });
});
