import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnouncementCard } from "./AnnouncementCard";

const defaultProps = {
  title: "Test Announcement",
  summary: "This is a test summary.",
  slug: "test-announcement",
  categories: [{ id: "1", name: "News", slug: "news" }],
  tags: [{ id: "1", name: "Important", slug: "important" }],
  author: { name: "Alice" },
  publishedAt: "2026-03-10T00:00:00Z",
  visibility: "public" as const,
};

describe("AnnouncementCard", () => {
  it("renders the title", () => {
    render(<AnnouncementCard {...defaultProps} />);
    expect(screen.getByText("Test Announcement")).toBeInTheDocument();
  });

  it("renders the summary", () => {
    render(<AnnouncementCard {...defaultProps} />);
    expect(screen.getByText("This is a test summary.")).toBeInTheDocument();
  });

  it("renders the author name", () => {
    render(<AnnouncementCard {...defaultProps} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders categories as tags", () => {
    render(<AnnouncementCard {...defaultProps} />);
    expect(screen.getByText("News")).toBeInTheDocument();
  });

  it("renders tag labels", () => {
    render(<AnnouncementCard {...defaultProps} />);
    expect(screen.getByText("Important")).toBeInTheDocument();
  });

  it("renders visibility badge", () => {
    render(<AnnouncementCard {...defaultProps} />);
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  it("renders private visibility badge", () => {
    render(<AnnouncementCard {...defaultProps} visibility="private" />);
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("renders skeleton when loading", () => {
    const { container } = render(
      <AnnouncementCard {...defaultProps} loading />,
    );
    expect(container.querySelector("[aria-busy='true']")).toBeInTheDocument();
    expect(screen.queryByText("Test Announcement")).not.toBeInTheDocument();
  });

  it("sets data-slug attribute", () => {
    const { container } = render(<AnnouncementCard {...defaultProps} />);
    expect(container.querySelector("article")).toHaveAttribute(
      "data-slug",
      "test-announcement",
    );
  });

  it("handles empty categories gracefully", () => {
    render(<AnnouncementCard {...defaultProps} categories={[]} />);
    expect(screen.getByText("Test Announcement")).toBeInTheDocument();
  });

  it("handles empty tags gracefully", () => {
    render(<AnnouncementCard {...defaultProps} tags={[]} />);
    expect(screen.getByText("Test Announcement")).toBeInTheDocument();
  });

  it("truncates long title via line-clamp", () => {
    const { container } = render(
      <AnnouncementCard
        {...defaultProps}
        title="This is a very long title that should be truncated when displayed in the card component"
      />,
    );
    const heading = container.querySelector("h3");
    expect(heading?.className).toContain("line-clamp-2");
  });
});
