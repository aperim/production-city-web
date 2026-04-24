import type { Meta, StoryObj } from "@storybook/react-vite";
import { PlateImage } from "./PlateImage";

const meta = {
  title: "Molecules/PlateImage",
  component: PlateImage,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#0A0A0A" },
        { name: "paper", value: "#F7F5F0" },
      ],
    },
  },
} satisfies Meta<typeof PlateImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScreenSoundStage: Story = {
  args: {
    cornerLabel: "A · Screen Sound Stage",
    cornerLabelRight: "2,025 m²",
    centerLabel: "[ Stage interior · Full-surround LED ]",
    bottomItems: ["45 × 45 m", "H 15 m"],
    aspect: "4/3",
  },
};

export const BroadcastTheatre: Story = {
  args: {
    cornerLabel: "C · Broadcast Theatre",
    cornerLabelRight: "450 seats",
    centerLabel: "[ Audience mode · Gallery live ]",
    bottomItems: ["Theatre · Cabaret", "AR / VR ready"],
    aspect: "4/3",
  },
};

export const PortraitDark: Story = {
  args: {
    cornerLabel: "Portrait · M. Compton",
    cornerLabelRight: "Consented",
    centerLabel: "[ Photography to be commissioned. No appropriated motifs. ]",
    bottomItems: ["Wiradjuri", "COO · MD"],
    aspect: "3/4",
  },
};

export const FirstNationsPaper: Story = {
  parameters: {
    backgrounds: { default: "paper" },
  },
  args: {
    paper: true,
    accentBorder: "var(--ochre)",
    cornerLabel: "Portrait · M. Compton",
    cornerLabelRight: "Consented",
    centerLabel: "[ Photography commissioned with permission ]",
    bottomItems: ["Wiradjuri", "COO · MD"],
    aspect: "3/4",
  },
};

export const Widescreen: Story = {
  args: {
    cornerLabel: "D · Control Room",
    cornerLabelRight: "Central Spine",
    centerLabel: "[ Gallery · Live origination ]",
    bottomItems: ["On-campus + External", "Global"],
    aspect: "16/9",
  },
};

export const Square: Story = {
  args: {
    cornerLabel: "B · Commercial",
    cornerLabelRight: "100 m²",
    centerLabel: "[ Walk-in LED ]",
    aspect: "1/1",
  },
};
