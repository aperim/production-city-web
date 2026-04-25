import type { Meta, StoryObj } from "@storybook/react-vite";
import { PullQuote } from "./PullQuote";

const meta = {
  title: "Molecules/PullQuote",
  component: PullQuote,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PullQuote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "The first site carries an advantage that no subsequent site can replicate.",
  },
};

export const Wide: Story = {
  args: {
    wide: true,
    children: "The first site carries an advantage that no subsequent site can replicate. Sydney is that site.",
  },
};

export const WithAttribution: Story = {
  args: {
    children: "Built together, in one place.",
    attribution: "Production City — founding principle",
  },
};
