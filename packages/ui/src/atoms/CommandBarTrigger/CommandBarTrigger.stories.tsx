import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandBarTrigger } from "./CommandBarTrigger";

const meta = {
  title: "Atoms/CommandBarTrigger",
  component: CommandBarTrigger,
  tags: ["autodocs"],
  args: {
    onClick: () => alert("Command bar opened"),
  },
} satisfies Meta<typeof CommandBarTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: "Search features...",
  },
};

export const Focused: Story = {
  parameters: {
    pseudo: { focus: true },
  },
};
