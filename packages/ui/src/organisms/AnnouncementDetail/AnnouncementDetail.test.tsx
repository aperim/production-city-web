import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnnouncementDetail } from "./AnnouncementDetail";
import type { ContentBlock } from "../../types/announcements";

const blocks: ContentBlock[] = [
  { id: "1", position: 0, type: "header", level: "h2", text: "Section One" },
  { id: "2", position: 1, type: "text", markdown: "Some **content** here." },
];

const defaultProps = {
  title: "Test Announcement",
  summary: "A brief summary.",
  contentBlocks: blocks,
  categories: [{ id: "1", name: "News", slug: "news" }],
  tags: [{ id: "1", name: "Important", slug: "important" }],
  author: { name: "Alice" },
  publishedAt: "2026-03-10T00:00:00Z",
  lastEditedAt: null,
};

describe("AnnouncementDetail", () => {
  it("renders the title", () => {
    render(<AnnouncementDetail {...defaultProps} />);
    expect(screen.getByText("Test Announcement")).toBeInTheDocument();
  });

  it("renders the summary", () => {
    render(<AnnouncementDetail {...defaultProps} />);
    expect(screen.getByText("A brief summary.")).toBeInTheDocument();
  });

  it("renders content blocks", () => {
    render(<AnnouncementDetail {...defaultProps} />);
    expect(screen.getByText("Section One")).toBeInTheDocument();
  });

  it("renders author name", () => {
    render(<AnnouncementDetail {...defaultProps} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders categories", () => {
    render(<AnnouncementDetail {...defaultProps} />);
    expect(screen.getByText("News")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<AnnouncementDetail {...defaultProps} />);
    expect(screen.getByText("Important")).toBeInTheDocument();
  });

  it("shows updated date when lastEditedAt is provided", () => {
    render(
      <AnnouncementDetail
        {...defaultProps}
        lastEditedAt="2026-03-12T00:00:00Z"
      />,
    );
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  it("does not show updated text when lastEditedAt is null", () => {
    render(<AnnouncementDetail {...defaultProps} />);
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
  });
});
