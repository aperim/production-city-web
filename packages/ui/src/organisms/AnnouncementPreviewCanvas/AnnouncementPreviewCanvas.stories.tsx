import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementPreviewCanvas, type PreviewAnnouncement } from "./AnnouncementPreviewCanvas";

const meta: Meta<typeof AnnouncementPreviewCanvas> = {
  title: "Organisms/AnnouncementPreviewCanvas",
  component: AnnouncementPreviewCanvas,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof AnnouncementPreviewCanvas>;

const draftAnnouncement: PreviewAnnouncement = {
  id: "ann-1",
  title: "New Feature Launch",
  summary: "We are launching a new feature for Production City users.",
  contentBlocks: [
    { id: "1", position: 0, type: "text", markdown: "We are excited to announce the launch of our new communications platform." },
    { id: "2", position: 1, type: "text", markdown: "This platform provides a centralized hub for all internal communications." },
  ],
  categories: [
    { id: "cat-1", name: "News", slug: "news" },
    { id: "cat-2", name: "Product", slug: "product" },
  ],
  tags: [
    { id: "tag-1", name: "Important", slug: "important" },
  ],
  status: "draft",
  visibility: "public",
  author: { name: "Jane Smith" },
  publishedAt: "2026-03-17T10:00:00Z",
  lastEditedAt: null,
};

const baseProps = {
  onEdit: () => {},
  onPublish: () => {},
  onUnpublish: () => {},
  onArchive: () => {},
  hasPermission: () => true,
};

export const DraftPreview: Story = {
  render: () => (
    <AnnouncementPreviewCanvas {...baseProps} announcement={draftAnnouncement} />
  ),
};

export const PublishedWithStats: Story = {
  render: () => (
    <AnnouncementPreviewCanvas
      {...baseProps}
      announcement={{ ...draftAnnouncement, status: "published" }}
      deliveryStats={{ sent: 150, delivered: 142, failed: 8 }}
    />
  ),
};

export const Archived: Story = {
  render: () => (
    <AnnouncementPreviewCanvas
      {...baseProps}
      announcement={{ ...draftAnnouncement, status: "archived" }}
    />
  ),
};

export const PermissionRestricted: Story = {
  render: () => (
    <AnnouncementPreviewCanvas
      {...baseProps}
      announcement={draftAnnouncement}
      hasPermission={() => false}
    />
  ),
};

export const Loading: Story = {
  render: () => (
    <AnnouncementPreviewCanvas {...baseProps} announcement={draftAnnouncement} loading />
  ),
};
