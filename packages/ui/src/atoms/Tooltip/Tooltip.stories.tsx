import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button/Button";

const meta = {
  title: "Atoms/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  argTypes: {
    position: { control: "select", options: ["top", "right", "bottom", "left"] },
    showArrow: { control: "boolean" },
    enterDelay: { control: "number" },
    leaveDelay: { control: "number" },
    maxWidth: { control: "number" },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { content: "This is a tooltip", children: <Button>Hover me</Button> },
};

export const Top: Story = {
  args: { content: "Top tooltip", position: "top", children: <Button>Top</Button> },
};

export const Bottom: Story = {
  args: { content: "Bottom tooltip", position: "bottom", children: <Button>Bottom</Button> },
};

export const Left: Story = {
  args: { content: "Left tooltip", position: "left", children: <Button>Left</Button> },
};

export const Right: Story = {
  args: { content: "Right tooltip", position: "right", children: <Button>Right</Button> },
};

export const NoArrow: Story = {
  args: { content: "No arrow", showArrow: false, children: <Button>No Arrow</Button> },
};

export const RichContent: Story = {
  args: {
    content: (
      <div>
        <p className="font-medium">Title</p>
        <p>More detail here</p>
      </div>
    ),
    children: <Button>Rich Tooltip</Button>,
  },
};

export const AllPositions: StoryObj = {
  render: () => (
    <div className="flex gap-8 p-16 justify-center items-center">
      <Tooltip content="Top" position="top"><Button>Top</Button></Tooltip>
      <Tooltip content="Right" position="right"><Button>Right</Button></Tooltip>
      <Tooltip content="Bottom" position="bottom"><Button>Bottom</Button></Tooltip>
      <Tooltip content="Left" position="left"><Button>Left</Button></Tooltip>
    </div>
  ),
};
