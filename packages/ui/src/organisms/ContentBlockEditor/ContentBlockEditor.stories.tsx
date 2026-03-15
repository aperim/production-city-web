import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContentBlockEditor } from "./ContentBlockEditor";
import type { ContentBlock } from "../../types/announcements";

const meta = {
  title: "Organisms/ContentBlockEditor",
  component: ContentBlockEditor,
  tags: ["autodocs"],
} satisfies Meta<typeof ContentBlockEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleBlocks: ContentBlock[] = [
  { id: "1", position: 0, type: "header", level: "h1", text: "Welcome to Production City" },
  { id: "2", position: 1, type: "text", markdown: "We are excited to announce the **grand opening** of our new facilities." },
  { id: "3", position: 2, type: "image", src: "https://placehold.co/800x400/1a1a2e/e0e0e0?text=Studio", alt: "Studio" },
  { id: "4", position: 3, type: "spacer", size: "md" },
  { id: "5", position: 4, type: "image_text_left", src: "https://placehold.co/400x300/1a1a2e/e0e0e0?text=Facility", alt: "Facility", markdown: "Our state-of-the-art **soundstage** features the latest technology." },
];

export const Empty: Story = {
  args: {
    blocks: [],
    onChange: () => {},
    onMediaSelect: () => {},
    availableMedia: [],
  },
};

export const SingleBlock: Story = {
  args: {
    blocks: [sampleBlocks[0]!],
    onChange: () => {},
    onMediaSelect: () => {},
    availableMedia: [],
  },
};

export const MultipleBlocks: Story = {
  args: {
    blocks: sampleBlocks,
    onChange: () => {},
    onMediaSelect: () => {},
    availableMedia: [],
  },
};

export const SaveFailed: Story = {
  args: {
    blocks: sampleBlocks,
    onChange: () => {},
    onMediaSelect: () => {},
    availableMedia: [],
    error: "Failed to save changes. Please try again.",
  },
};
