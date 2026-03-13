import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton, SkeletonText } from "./Skeleton";

const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["rectangular", "circular", "text"] },
    width: { control: "text" },
    height: { control: "text" },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rectangular: Story = {
  args: { variant: "rectangular", height: 120 },
};

export const Circular: Story = {
  args: { variant: "circular", width: 48, height: 48 },
};

export const Text: Story = {
  args: { variant: "text" },
};

export const MultipleTextLines: StoryObj = {
  render: () => <SkeletonText lines={4} />,
};

export const CardSkeleton: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3 p-4 border border-border rounded-sm w-72">
      <Skeleton variant="rectangular" height={160} />
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  ),
};

export const ListSkeleton: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-4 w-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <SkeletonText lines={2} />
          </div>
        </div>
      ))}
    </div>
  ),
};
