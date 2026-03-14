import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectionDot } from "./ConnectionDot";

const meta = {
  title: "Atoms/ConnectionDot",
  component: ConnectionDot,
  tags: ["autodocs"],
  argTypes: {
    state: { control: "select", options: ["connected", "reconnecting", "disconnected"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof ConnectionDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {
  args: { state: "connected" },
};

export const Reconnecting: Story = {
  args: { state: "reconnecting" },
};

export const Disconnected: Story = {
  args: { state: "disconnected" },
};

export const AllSizes: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <ConnectionDot size="sm" />
      <ConnectionDot size="md" />
      <ConnectionDot size="lg" />
    </div>
  ),
};

export const AllStates: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <ConnectionDot state="connected" />
      <ConnectionDot state="reconnecting" />
      <ConnectionDot state="disconnected" />
    </div>
  ),
};
