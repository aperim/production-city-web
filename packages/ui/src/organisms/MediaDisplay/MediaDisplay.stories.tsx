import type { Meta, StoryObj } from "@storybook/react-vite";
import { MediaDisplay } from "./MediaDisplay";

const meta = {
  title: "Organisms/MediaDisplay",
  component: MediaDisplay,
  tags: ["autodocs"],
  args: {
    lightSrc: "/media/placeholder-light.svg",
    darkSrc: "/media/placeholder-dark.svg",
    alt: "Sample media",
    width: 800,
    height: 600,
    photographer: "Jane Doe",
    photographerUrl: "https://example.com/jane",
    source: "Pexels",
    sourceUrl: "https://pexels.com",
  },
} satisfies Meta<typeof MediaDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAiAssistedBadge: Story = {
  args: { aiAssisted: true },
};

export const WithAiGeneratedBadge: Story = {
  args: { aiGenerated: true },
};

export const WithFirstNationsBadge: Story = {
  args: { hasFirstNationsPermission: true },
};

export const AllBadges: Story = {
  args: {
    aiAssisted: true,
    aiGenerated: true,
    hasFirstNationsPermission: true,
  },
};

export const NoBadges: Story = {
  args: {
    photographerUrl: undefined,
    sourceUrl: undefined,
  },
};

export const CustomAspectRatio: Story = {
  args: { aspectRatio: "16/9" },
};

export const ErrorState: Story = {
  args: {
    lightSrc: "/media/nonexistent.jpg",
    alt: "Failed image",
  },
};

export const LongPhotographerName: Story = {
  args: {
    photographer: "Extremely Long Photographer Name That Should Be Truncated At Some Point",
  },
};

export const WithoutPhotographerUrl: Story = {
  args: {
    photographerUrl: undefined,
  },
};
