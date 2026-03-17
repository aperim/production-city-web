import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementEditorCanvas } from "./AnnouncementEditorCanvas";

const meta: Meta<typeof AnnouncementEditorCanvas> = {
  title: "Organisms/AnnouncementEditorCanvas",
  component: AnnouncementEditorCanvas,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof AnnouncementEditorCanvas>;

const categories = [
  { id: "cat-1", name: "News", slug: "news" },
  { id: "cat-2", name: "Updates", slug: "updates" },
  { id: "cat-3", name: "Events", slug: "events" },
];

const tags = [
  { id: "tag-1", name: "Important", slug: "important" },
  { id: "tag-2", name: "Urgent", slug: "urgent" },
  { id: "tag-3", name: "Internal", slug: "internal" },
];

const baseProps = {
  categories,
  tags,
  onSave: () => {},
  onPublish: () => {},
  onCancel: () => {},
};

export const CreateMode: Story = {
  render: () => <AnnouncementEditorCanvas {...baseProps} />,
};

export const EditMode: Story = {
  render: () => (
    <AnnouncementEditorCanvas
      {...baseProps}
      announcementId="ann-123"
      initialData={{
        title: "Existing Announcement",
        summary: "This is an existing announcement being edited.",
        contentBlocks: [
          { id: "1", position: 0, type: "text", markdown: "Content here." },
        ],
        visibility: "public",
        categoryIds: ["cat-1"],
        tagIds: ["tag-1"],
        roleIds: [],
      }}
    />
  ),
};

export const Loading: Story = {
  render: () => <AnnouncementEditorCanvas {...baseProps} loading />,
};

export const ValidationErrors: Story = {
  name: "With Validation Errors (click Publish)",
  render: () => <AnnouncementEditorCanvas {...baseProps} />,
};
