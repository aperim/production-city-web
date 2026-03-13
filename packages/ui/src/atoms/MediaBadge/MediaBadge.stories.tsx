import type { Meta, StoryObj } from "@storybook/react-vite";
import { MediaBadge } from "./MediaBadge";

const meta = {
  title: "Atoms/MediaBadge",
  component: MediaBadge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["ai-assisted", "ai-generated", "first-nations"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
  },
} satisfies Meta<typeof MediaBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AiAssisted: Story = {
  args: { variant: "ai-assisted" },
};

export const AiGenerated: Story = {
  args: { variant: "ai-generated" },
};

export const FirstNations: Story = {
  args: { variant: "first-nations" },
};

export const SmallSize: Story = {
  args: { variant: "ai-assisted", size: "sm" },
};

export const AllVariants: Story = {
  args: { variant: "ai-assisted" },
  render: () => (
    <div className="flex items-center gap-3">
      <MediaBadge variant="ai-assisted" />
      <MediaBadge variant="ai-generated" />
      <MediaBadge variant="first-nations" />
    </div>
  ),
};

export const AllVariantsSmall: Story = {
  args: { variant: "ai-assisted", size: "sm" },
  render: () => (
    <div className="flex items-center gap-3">
      <MediaBadge variant="ai-assisted" size="sm" />
      <MediaBadge variant="ai-generated" size="sm" />
      <MediaBadge variant="first-nations" size="sm" />
    </div>
  ),
};
