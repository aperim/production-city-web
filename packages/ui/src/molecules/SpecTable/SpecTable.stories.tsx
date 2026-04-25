import type { Meta, StoryObj } from "@storybook/react-vite";
import { SpecTable } from "./SpecTable";

const meta = {
  title: "Molecules/SpecTable",
  component: SpecTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SpecTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScreenSoundStage: Story = {
  args: {
    rows: [
      { label: "Floor area", value: "2,025 m² · 21,797 ft²" },
      { label: "To grid", value: "15 m · 49 ft" },
      { label: "Acoustics", value: "NRC 1.05 · NC 25" },
      { label: "LED volume", value: "Flat · Arc · Full-surround" },
    ],
  },
};

export const BroadcastTheatre: Story = {
  args: {
    rows: [
      { label: "Theatre", value: "450 seats" },
      { label: "Cabaret", value: "300 seats" },
      { label: "Robotic cameras", value: "8 integrated positions" },
      { label: "Virtual sets", value: "Library + bespoke" },
    ],
  },
};

export const SingleRow: Story = {
  args: {
    rows: [{ label: "Floor area", value: "100 m²" }],
  },
};
