import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementDetail } from "./AnnouncementDetail";
import type { ContentBlock } from "../../types/announcements";

const meta = {
  title: "Organisms/AnnouncementDetail",
  component: AnnouncementDetail,
  tags: ["autodocs"],
} satisfies Meta<typeof AnnouncementDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

const minimalBlocks: ContentBlock[] = [
  { id: "1", position: 0, type: "text", markdown: "A simple text announcement with **bold** content." },
];

const fullBlocks: ContentBlock[] = [
  { id: "1", position: 0, type: "header", level: "h1", text: "Grand Opening Announcement" },
  { id: "2", position: 1, type: "text", markdown: "We are thrilled to announce the **grand opening** of our newly renovated facilities.\n\nJoin us for the celebration on March 15th, 2026." },
  { id: "3", position: 2, type: "image", src: "https://placehold.co/800x400/1a1a2e/e0e0e0?text=Grand+Opening", alt: "Grand Opening", caption: "Our new main entrance" },
  { id: "4", position: 3, type: "spacer", size: "md" },
  { id: "5", position: 4, type: "header", level: "h2", text: "What to Expect" },
  { id: "6", position: 5, type: "image_text_left", src: "https://placehold.co/400x300/1a1a2e/e0e0e0?text=Studio+A", alt: "Studio A", markdown: "**Studio A** has been completely transformed with state-of-the-art equipment and improved acoustics." },
  { id: "7", position: 6, type: "spacer", size: "sm" },
  { id: "8", position: 7, type: "image_text_right", src: "https://placehold.co/400x300/1a1a2e/e0e0e0?text=Lounge", alt: "Lounge", markdown: "The new **creative lounge** provides a comfortable space for collaboration and brainstorming." },
];

export const Minimal: Story = {
  args: {
    title: "Quick Update",
    summary: "A brief update about operations.",
    contentBlocks: minimalBlocks,
    categories: [{ id: "1", name: "Updates", slug: "updates" }],
    tags: [],
    author: { name: "Production Team" },
    publishedAt: "2026-03-10T09:00:00Z",
    lastEditedAt: null,
  },
};

export const Full: Story = {
  args: {
    title: "Grand Opening: Renovated Facilities",
    summary: "Join us for the grand opening of our newly renovated production facilities, featuring state-of-the-art equipment and improved spaces.",
    contentBlocks: fullBlocks,
    categories: [
      { id: "1", name: "Facilities", slug: "facilities" },
      { id: "2", name: "Events", slug: "events" },
    ],
    tags: [
      { id: "1", name: "Renovation", slug: "renovation" },
      { id: "2", name: "Opening", slug: "opening" },
    ],
    author: { name: "Production City Team" },
    publishedAt: "2026-03-10T09:00:00Z",
    lastEditedAt: null,
  },
};

export const Updated: Story = {
  args: {
    ...Full.args,
    lastEditedAt: "2026-03-12T14:30:00Z",
  },
};

export const LongContent: Story = {
  args: {
    ...Full.args,
    contentBlocks: [
      ...fullBlocks,
      { id: "9", position: 8, type: "spacer", size: "lg" } as ContentBlock,
      { id: "10", position: 9, type: "header", level: "h2", text: "Additional Details" } as ContentBlock,
      { id: "11", position: 10, type: "text", markdown: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. **Duis aute irure dolor** in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." } as ContentBlock,
    ],
  },
};
