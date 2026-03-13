import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./Divider";

const meta = {
  title: "Atoms/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    variant: { control: "select", options: ["solid", "dashed"] },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
};

export const HorizontalDashed: Story = {
  args: { orientation: "horizontal", variant: "dashed" },
};

export const WithLabel: Story = {
  args: { orientation: "horizontal", label: "OR" },
};

export const WithLabelDashed: Story = {
  args: { orientation: "horizontal", variant: "dashed", label: "OR" },
};

export const Vertical: StoryObj = {
  render: () => (
    <div className="flex h-8 items-center">
      <span className="text-sm">Item A</span>
      <Divider orientation="vertical" />
      <span className="text-sm">Item B</span>
      <Divider orientation="vertical" />
      <span className="text-sm">Item C</span>
    </div>
  ),
};

export const VerticalDashed: StoryObj = {
  render: () => (
    <div className="flex h-8 items-center">
      <span className="text-sm">Item A</span>
      <Divider orientation="vertical" variant="dashed" />
      <span className="text-sm">Item B</span>
    </div>
  ),
};
