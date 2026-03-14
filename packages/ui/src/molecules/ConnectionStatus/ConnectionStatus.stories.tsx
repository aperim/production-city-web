import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectionStatus } from "./ConnectionStatus";

const meta = {
  title: "Molecules/ConnectionStatus",
  component: ConnectionStatus,
  tags: ["autodocs"],
  argTypes: {
    state: { control: "select", options: ["connected", "reconnecting", "disconnected"] },
    compact: { control: "boolean" },
  },
} satisfies Meta<typeof ConnectionStatus>;

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

export const Compact: Story = {
  args: { state: "disconnected", compact: true },
};

export const AllStates: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-3">
      <ConnectionStatus state="connected" />
      <ConnectionStatus state="reconnecting" />
      <ConnectionStatus state="disconnected" />
    </div>
  ),
};
