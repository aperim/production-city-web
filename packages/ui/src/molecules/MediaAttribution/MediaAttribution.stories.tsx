import type { Meta, StoryObj } from "@storybook/react-vite";
import { MediaAttribution } from "./MediaAttribution";

const meta = {
  title: "Molecules/MediaAttribution",
  component: MediaAttribution,
  tags: ["autodocs"],
} satisfies Meta<typeof MediaAttribution>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    photographer: "Jane Doe",
    photographerUrl: "https://example.com/jane",
    source: "Pexels",
    sourceUrl: "https://pexels.com",
  },
};

export const WithAiAssistedBadge: Story = {
  args: {
    photographer: "Jane Doe",
    source: "Pexels",
    aiAssisted: true,
  },
};

export const WithAiGeneratedBadge: Story = {
  args: {
    photographer: "AI Studio",
    source: "Internal",
    aiGenerated: true,
  },
};

export const WithFirstNationsBadge: Story = {
  args: {
    photographer: "Cultural Archive",
    source: "Community Collection",
    hasFirstNationsPermission: true,
  },
};

export const AllBadges: Story = {
  args: {
    photographer: "Jane Doe",
    photographerUrl: "https://example.com/jane",
    source: "Pexels",
    sourceUrl: "https://pexels.com",
    aiAssisted: true,
    aiGenerated: true,
    hasFirstNationsPermission: true,
  },
};

export const NoBadges: Story = {
  args: {
    photographer: "Jane Doe",
    source: "Pexels",
  },
};

export const NoLinks: Story = {
  args: {
    photographer: "Jane Doe",
    source: "Internal Library",
    aiAssisted: true,
  },
};
