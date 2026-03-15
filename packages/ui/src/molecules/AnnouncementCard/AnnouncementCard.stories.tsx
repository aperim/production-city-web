import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementCard } from "./AnnouncementCard";

const meta = {
  title: "Molecules/AnnouncementCard",
  component: AnnouncementCard,
  tags: ["autodocs"],
} satisfies Meta<typeof AnnouncementCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  title: "Studio A Renovation Complete",
  summary:
    "The renovation of Studio A is now complete. The new space features state-of-the-art equipment and improved acoustics.",
  slug: "studio-a-renovation",
  categories: [{ id: "1", name: "Facilities", slug: "facilities" }],
  tags: [{ id: "1", name: "Renovation", slug: "renovation" }],
  author: { name: "Production Team" },
  publishedAt: "2026-03-10T09:00:00Z",
  visibility: "public" as const,
};

export const PublicAnnouncement: Story = {
  args: baseArgs,
};

export const PrivateAnnouncement: Story = {
  args: { ...baseArgs, visibility: "private" },
};

export const LongTitle: Story = {
  args: {
    ...baseArgs,
    title:
      "This is a very long announcement title that should be truncated when it exceeds the available space in the card layout",
  },
};

export const MultipleCategories: Story = {
  args: {
    ...baseArgs,
    categories: [
      { id: "1", name: "Facilities", slug: "facilities" },
      { id: "2", name: "Equipment", slug: "equipment" },
      { id: "3", name: "Updates", slug: "updates" },
    ],
  },
};

export const NoTags: Story = {
  args: { ...baseArgs, tags: [] },
};

export const Loading: Story = {
  args: { ...baseArgs, loading: true },
};
