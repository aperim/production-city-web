import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkeletonCard } from "./SkeletonCard";

const meta = {
  title: "Molecules/SkeletonCard",
  component: SkeletonCard,
  tags: ["autodocs"],
} satisfies Meta<typeof SkeletonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GridOfCards: StoryObj = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  ),
};

export const CustomWidth: Story = {
  args: { className: "w-72" },
};
