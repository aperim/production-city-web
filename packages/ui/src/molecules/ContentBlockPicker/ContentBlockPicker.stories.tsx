import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContentBlockPicker } from "./ContentBlockPicker";

const meta = {
  title: "Molecules/ContentBlockPicker",
  component: ContentBlockPicker,
  tags: ["autodocs"],
} satisfies Meta<typeof ContentBlockPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { onSelect: () => {} },
};

export const Disabled: Story = {
  args: { onSelect: () => {}, disabled: true },
};
