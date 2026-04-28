import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatCallout } from "./StatCallout";

const meta = {
  title: "Atoms/StatCallout",
  component: StatCallout,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "muted", "accent"],
    },
  },
} satisfies Meta<typeof StatCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "3.83",
    prefix: "$",
    suffix: "B",
    label: "Global VP market (2025)",
  },
};

export const WithContext: Story = {
  args: {
    value: "42",
    suffix: "%",
    label: "Production cost reduction",
    context: "Compared to traditional LED-wall workflows",
  },
};

export const Accent: Story = {
  args: {
    value: "1,200",
    label: "Shooting days per year",
    context: "Across all facilities",
    variant: "accent",
  },
};

export const Muted: Story = {
  args: {
    value: "2030",
    label: "Target net zero year",
    variant: "muted",
  },
};
