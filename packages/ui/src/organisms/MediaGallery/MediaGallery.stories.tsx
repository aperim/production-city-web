import type { Meta, StoryObj } from "@storybook/react-vite";
import { MediaGallery } from "./MediaGallery";
import type { MediaDisplayProps } from "../MediaDisplay/MediaDisplay";

const makeItem = (id: number, overrides?: Partial<MediaDisplayProps>): MediaDisplayProps => ({
  lightSrc: `/media/placeholder-light.svg`,
  alt: `Photo ${id}`,
  width: 800,
  height: 600,
  photographer: `Photographer ${id}`,
  source: "Pexels",
  ...overrides,
});

const meta = {
  title: "Organisms/MediaGallery",
  component: MediaGallery,
  tags: ["autodocs"],
} satisfies Meta<typeof MediaGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeColumns: Story = {
  args: {
    items: Array.from({ length: 6 }, (_, i) => makeItem(i + 1)),
    columns: 3,
  },
};

export const TwoColumns: Story = {
  args: {
    items: Array.from({ length: 4 }, (_, i) => makeItem(i + 1)),
    columns: 2,
  },
};

export const OneColumn: Story = {
  args: {
    items: [makeItem(1), makeItem(2)],
    columns: 1,
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const MixedBadges: Story = {
  args: {
    items: [
      makeItem(1, { aiAssisted: true }),
      makeItem(2, { aiGenerated: true }),
      makeItem(3, { hasFirstNationsPermission: true }),
      makeItem(4, { aiAssisted: true, aiGenerated: true }),
      makeItem(5),
      makeItem(6, { hasFirstNationsPermission: true, aiAssisted: true }),
    ],
    columns: 3,
  },
};
