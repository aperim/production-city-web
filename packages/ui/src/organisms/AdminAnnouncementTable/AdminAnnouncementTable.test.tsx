import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdminAnnouncementTable } from "./AdminAnnouncementTable";
import type { AdminAnnouncement } from "../../types/announcements";

const announcements: AdminAnnouncement[] = [
  {
    id: "a1",
    title: "Draft Announcement",
    summary: "Summary",
    slug: "draft",
    categories: [],
    tags: [],
    author: { name: "Alice" },
    publishedAt: "2026-03-10T00:00:00Z",
    visibility: "public",
    status: "draft",
    contentBlocks: [],
    createdAt: "2026-03-09T00:00:00Z",
    updatedAt: "2026-03-09T00:00:00Z",
  },
  {
    id: "a2",
    title: "Published Announcement",
    summary: "Summary",
    slug: "published",
    categories: [],
    tags: [],
    author: { name: "Bob" },
    publishedAt: "2026-03-11T00:00:00Z",
    visibility: "private",
    status: "published",
    contentBlocks: [],
    createdAt: "2026-03-10T00:00:00Z",
    updatedAt: "2026-03-10T00:00:00Z",
  },
  {
    id: "a3",
    title: "Archived Announcement",
    summary: "Summary",
    slug: "archived",
    categories: [],
    tags: [],
    author: { name: "Charlie" },
    publishedAt: "2026-03-08T00:00:00Z",
    visibility: "public",
    status: "archived",
    contentBlocks: [],
    createdAt: "2026-03-07T00:00:00Z",
    updatedAt: "2026-03-07T00:00:00Z",
  },
];

const defaultPagination = { page: 1, totalPages: 1, onPageChange: vi.fn() };

describe("AdminAnnouncementTable", () => {
  it("renders announcement titles", () => {
    render(
      <AdminAnnouncementTable
        announcements={announcements}
        onEdit={vi.fn()}
        onPublish={vi.fn()}
        onArchive={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("Draft Announcement")).toBeInTheDocument();
    expect(screen.getByText("Published Announcement")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <AdminAnnouncementTable
        announcements={[]}
        onEdit={vi.fn()}
        onPublish={vi.fn()}
        onArchive={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("No announcements found.")).toBeInTheDocument();
  });

  it("renders loading skeletons", () => {
    const { container } = render(
      <AdminAnnouncementTable
        announcements={[]}
        onEdit={vi.fn()}
        onPublish={vi.fn()}
        onArchive={vi.fn()}
        pagination={defaultPagination}
        loading
      />,
    );
    expect(container.querySelectorAll("[aria-busy='true']").length).toBe(5);
  });

  it("shows Publish button for draft announcements", () => {
    render(
      <AdminAnnouncementTable
        announcements={announcements}
        onEdit={vi.fn()}
        onPublish={vi.fn()}
        onArchive={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("Publish")).toBeInTheDocument();
  });

  it("shows Archive button for published announcements", () => {
    render(
      <AdminAnnouncementTable
        announcements={announcements}
        onEdit={vi.fn()}
        onPublish={vi.fn()}
        onArchive={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("Archive")).toBeInTheDocument();
  });

  it("calls onEdit when Edit is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <AdminAnnouncementTable
        announcements={announcements}
        onEdit={onEdit}
        onPublish={vi.fn()}
        onArchive={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    const editBtns = screen.getAllByText("Edit");
    await user.click(editBtns[0]!);
    expect(onEdit).toHaveBeenCalledWith("a1");
  });

  it("renders status badges", () => {
    render(
      <AdminAnnouncementTable
        announcements={announcements}
        onEdit={vi.fn()}
        onPublish={vi.fn()}
        onArchive={vi.fn()}
        pagination={defaultPagination}
      />,
    );
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });
});
