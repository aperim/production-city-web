import type { Meta, StoryObj } from "@storybook/react-vite";
import { AttributionLink } from "./AttributionLink";

const meta = {
  title: "Atoms/AttributionLink",
  component: AttributionLink,
  tags: ["autodocs"],
} satisfies Meta<typeof AttributionLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLinks: Story = {
  args: {
    photographer: "Jane Doe",
    photographerUrl: "https://example.com/jane",
    source: "Pexels",
    sourceUrl: "https://pexels.com",
  },
};

export const WithoutLinks: Story = {
  args: {
    photographer: "Jane Doe",
    source: "Pexels",
  },
};

export const LongPhotographerName: Story = {
  args: {
    photographer: "Extremely Long Photographer Name That Should Be Truncated",
    photographerUrl: "https://example.com/long",
    source: "Pexels",
    sourceUrl: "https://pexels.com",
  },
};

export const PhotographerLinkOnly: Story = {
  args: {
    photographer: "Jane Doe",
    photographerUrl: "https://example.com/jane",
    source: "Internal Library",
  },
};

export const SourceLinkOnly: Story = {
  args: {
    photographer: "Jane Doe",
    source: "Pexels",
    sourceUrl: "https://pexels.com",
  },
};
