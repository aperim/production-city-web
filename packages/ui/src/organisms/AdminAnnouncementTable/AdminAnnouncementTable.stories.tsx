import type { Meta, StoryObj } from "@storybook/react-vite";
import { AdminAnnouncementTable } from "./AdminAnnouncementTable";
import type { AdminAnnouncement } from "../../types/announcements";

const meta = {
  title: "Organisms/AdminAnnouncementTable",
  component: AdminAnnouncementTable,
  tags: ["autodocs"],
} satisfies Meta<typeof AdminAnnouncementTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeAnnouncements = (): AdminAnnouncement[] => [
  {
    id: "a1", title: "Studio A Renovation", summary: "Renovation complete", slug: "studio-a",
    categories: [], tags: [], author: { name: "Alice" }, publishedAt: "2026-03-10T00:00:00Z",
    visibility: "public", status: "published", contentBlocks: [], createdAt: "2026-03-09T00:00:00Z", updatedAt: "2026-03-10T00:00:00Z",
  },
  {
    id: "a2", title: "Equipment Upgrade Draft", summary: "New equipment arriving", slug: "equipment",
    categories: [], tags: [], author: { name: "Bob" }, publishedAt: "2026-03-12T00:00:00Z",
    visibility: "private", status: "draft", contentBlocks: [], createdAt: "2026-03-11T00:00:00Z", updatedAt: "2026-03-11T00:00:00Z",
  },
  {
    id: "a3", title: "Old Notice (Archived)", summary: "This was archived", slug: "old-notice",
    categories: [], tags: [], author: { name: "Charlie" }, publishedAt: "2026-02-01T00:00:00Z",
    visibility: "public", status: "archived", contentBlocks: [], createdAt: "2026-01-30T00:00:00Z", updatedAt: "2026-02-01T00:00:00Z",
  },
];

export const Default: Story = {
  args: {
    announcements: makeAnnouncements(),
    onEdit: () => {},
    onPublish: () => {},
    onArchive: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
  },
};

export const Empty: Story = {
  args: {
    announcements: [],
    onEdit: () => {},
    onPublish: () => {},
    onArchive: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
  },
};

export const Loading: Story = {
  args: { ...Default.args, loading: true },
};

export const MixedStatuses: Story = {
  args: Default.args,
};
