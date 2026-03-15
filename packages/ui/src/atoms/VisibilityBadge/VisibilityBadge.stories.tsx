import type { Meta, StoryObj } from "@storybook/react-vite";
import { VisibilityBadge } from "./VisibilityBadge";

const meta = {
  title: "Atoms/VisibilityBadge",
  component: VisibilityBadge,
  tags: ["autodocs"],
  argTypes: {
    visibility: {
      control: "select",
      options: ["public", "private"],
    },
  },
} satisfies Meta<typeof VisibilityBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Public: Story = {
  args: { visibility: "public" },
};

export const Private: Story = {
  args: { visibility: "private" },
};
