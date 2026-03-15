import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AnnouncementList } from "./AnnouncementList";
import type { AnnouncementSummary, Category } from "../../types/announcements";

const categories: Category[] = [
  { id: "1", name: "News", slug: "news" },
  { id: "2", name: "Events", slug: "events" },
];

const announcements: AnnouncementSummary[] = [
  {
    id: "a1",
    title: "First Announcement",
    summary: "Summary one",
    slug: "first",
    categories: [categories[0]!],
    tags: [],
    author: { name: "Alice" },
    publishedAt: "2026-03-10T00:00:00Z",
    visibility: "public",
  },
  {
    id: "a2",
    title: "Second Announcement",
    summary: "Summary two",
    slug: "second",
    categories: [categories[1]!],
    tags: [],
    author: { name: "Bob" },
    publishedAt: "2026-03-11T00:00:00Z",
    visibility: "private",
  },
];

const defaultPagination = { page: 1, totalPages: 1, onPageChange: vi.fn() };

describe("AnnouncementList", () => {
  it("renders announcement cards", () => {
    render(
      <AnnouncementList
        announcements={announcements}
        categories={categories}
        activeCategory={null}
        onCategoryFilter={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("First Announcement")).toBeInTheDocument();
    expect(screen.getByText("Second Announcement")).toBeInTheDocument();
  });

  it("renders empty state when no announcements", () => {
    render(
      <AnnouncementList
        announcements={[]}
        categories={categories}
        activeCategory={null}
        onCategoryFilter={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("No announcements found.")).toBeInTheDocument();
  });

  it("renders skeleton cards when loading", () => {
    const { container } = render(
      <AnnouncementList
        announcements={[]}
        categories={categories}
        activeCategory={null}
        onCategoryFilter={vi.fn()}
        pagination={defaultPagination}
        loading
      />,
    );
    const skeletons = container.querySelectorAll("[aria-busy='true']");
    expect(skeletons.length).toBe(6);
  });

  it("renders category filter buttons", () => {
    render(
      <AnnouncementList
        announcements={announcements}
        categories={categories}
        activeCategory={null}
        onCategoryFilter={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getAllByText("News").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Events").length).toBeGreaterThanOrEqual(1);
  });

  it("calls onCategoryFilter when category clicked", async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    render(
      <AnnouncementList
        announcements={announcements}
        categories={categories}
        activeCategory={null}
        onCategoryFilter={onFilter}
        pagination={defaultPagination}
      />,
    );
    // Click the News button in the filter bar (first one is the filter, second may be on a card)
    const filterGroup = screen.getByRole("group", { name: "Filter by category" });
    const newsBtn = filterGroup.querySelector('[data-slug="news"]') as HTMLElement;
    await user.click(newsBtn);
    expect(onFilter).toHaveBeenCalledWith("news");
  });

  it("renders error state", () => {
    render(
      <AnnouncementList
        announcements={[]}
        categories={categories}
        activeCategory={null}
        onCategoryFilter={vi.fn()}
        pagination={defaultPagination}
        error="Failed to load announcements"
      />,
    );
    expect(screen.getByText("Failed to load announcements")).toBeInTheDocument();
  });

  it("renders pagination when multiple pages", () => {
    render(
      <AnnouncementList
        announcements={announcements}
        categories={categories}
        activeCategory={null}
        onCategoryFilter={vi.fn()}
        pagination={{ page: 1, totalPages: 3, onPageChange: vi.fn() }}
      />,
    );
    // Pagination should be rendered
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("hides pagination for single page", () => {
    render(
      <AnnouncementList
        announcements={announcements}
        categories={categories}
        activeCategory={null}
        onCategoryFilter={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    // Page numbers 2, 3 should not appear
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });
});
