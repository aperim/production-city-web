import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryTag } from "./CategoryTag";

const meta = {
  title: "Atoms/CategoryTag",
  component: CategoryTag,
  tags: ["autodocs"],
  argTypes: {
    active: { control: "boolean" },
  },
} satisfies Meta<typeof CategoryTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { name: "General", slug: "general" },
};

export const Active: Story = {
  args: { name: "Updates", slug: "updates", active: true },
};

export const Clickable: Story = {
  args: { name: "Events", slug: "events", onClick: () => {} },
};
