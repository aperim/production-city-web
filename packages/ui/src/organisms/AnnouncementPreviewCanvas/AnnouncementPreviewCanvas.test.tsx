/**
 * Tests for AnnouncementPreviewCanvas organism.
 * TDD: written before implementation.
 *
 * @see Issue #443
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnnouncementPreviewCanvas } from "./AnnouncementPreviewCanvas";

const baseProps = {
  announcement: {
    id: "ann-1",
    title: "Test Announcement",
    summary: "A test announcement summary.",
    contentBlocks: [
      { id: "1", position: 0, type: "text" as const, markdown: "Hello world" },
    ],
    categories: [{ id: "cat-1", name: "News", slug: "news" }],
    tags: [{ id: "tag-1", name: "Important", slug: "important" }],
    status: "draft" as const,
    visibility: "public" as const,
    author: { name: "Test Author" },
    publishedAt: "2026-03-17T00:00:00Z",
    lastEditedAt: null,
  },
  onEdit: vi.fn(),
  onPublish: vi.fn(),
  onUnpublish: vi.fn(),
  onArchive: vi.fn(),
  hasPermission: () => true,
};

describe("AnnouncementPreviewCanvas", () => {
  it("renders announcement title and summary", () => {
    render(<AnnouncementPreviewCanvas {...baseProps} />);
    expect(screen.getByText("Test Announcement")).toBeDefined();
    expect(screen.getByText("A test announcement summary.")).toBeDefined();
  });

  it("renders content blocks", () => {
    render(<AnnouncementPreviewCanvas {...baseProps} />);
    expect(screen.getByText("Hello world")).toBeDefined();
  });

  it("renders edit button", () => {
    render(<AnnouncementPreviewCanvas {...baseProps} />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeDefined();
  });

  it("calls onEdit when edit clicked", () => {
    const onEdit = vi.fn();
    render(<AnnouncementPreviewCanvas {...baseProps} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    expect(onEdit).toHaveBeenCalled();
  });

  it("shows publish button for drafts", () => {
    render(<AnnouncementPreviewCanvas {...baseProps} />);
    expect(screen.getByRole("button", { name: /publish/i })).toBeDefined();
  });

  it("shows unpublish button for published announcements", () => {
    render(
      <AnnouncementPreviewCanvas
        {...baseProps}
        announcement={{ ...baseProps.announcement, status: "published" }}
      />,
    );
    expect(screen.getByRole("button", { name: /unpublish/i })).toBeDefined();
  });

  it("hides publish when user lacks permission", () => {
    render(
      <AnnouncementPreviewCanvas
        {...baseProps}
        hasPermission={(p) => p !== "announcement:publish"}
      />,
    );
    expect(screen.queryByRole("button", { name: /publish/i })).toBeNull();
  });

  it("hides archive when user lacks permission", () => {
    render(
      <AnnouncementPreviewCanvas
        {...baseProps}
        hasPermission={(p) => p !== "announcement:delete"}
      />,
    );
    expect(screen.queryByRole("button", { name: /archive/i })).toBeNull();
  });

  it("renders delivery stats when provided", () => {
    render(
      <AnnouncementPreviewCanvas
        {...baseProps}
        announcement={{
          ...baseProps.announcement,
          status: "published",
        }}
        deliveryStats={{ sent: 150, delivered: 142, failed: 8 }}
      />,
    );
    expect(screen.getByText("150")).toBeDefined();
    expect(screen.getByText("142")).toBeDefined();
  });

  it("renders loading state", () => {
    render(<AnnouncementPreviewCanvas {...baseProps} loading />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("accepts custom className", () => {
    const { container } = render(
      <AnnouncementPreviewCanvas {...baseProps} className="custom" />,
    );
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});
