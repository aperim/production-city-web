import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatStrip } from "./StatStrip";

const meta = {
  title: "Molecules/StatStrip",
  component: StatStrip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "ink",
      values: [{ name: "ink", value: "#1A1A14" }],
    },
  },
} satisfies Meta<typeof StatStrip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stats: [
      { value: "1", label: "operator" },
      { value: "2", label: "lanes, in parallel" },
      { value: "19", label: "stations from idea to audience" },
      { value: "1", unit: " loop", label: "analytics → ideation" },
    ],
  },
};

export const TwoStats: Story = {
  args: {
    stats: [
      { value: "450", label: "seats" },
      { value: "8", label: "robotic camera positions" },
    ],
  },
};

export const ThreeStats: Story = {
  args: {
    stats: [
      { value: "2,025", unit: " m²", label: "screen sound stage" },
      { value: "450", label: "theatre seats" },
      { value: "16", label: "integrated services" },
    ],
  },
};
