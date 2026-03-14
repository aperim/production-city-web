import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConnectionBanner } from "./ConnectionBanner";

const meta = {
  title: "Organisms/ConnectionBanner",
  component: ConnectionBanner,
  tags: ["autodocs"],
  argTypes: {
    state: { control: "select", options: [null, "disconnected", "reconnecting"] },
  },
} satisfies Meta<typeof ConnectionBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Disconnected: Story = {
  args: { state: "disconnected" },
};

export const Reconnecting: Story = {
  args: { state: "reconnecting" },
};

export const Hidden: Story = {
  args: { state: null },
};

export const CustomMessage: Story = {
  args: { state: "disconnected", message: "Connection to server lost. Data may be stale." },
};

export const AllStates: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-2">
      <ConnectionBanner state="disconnected" />
      <ConnectionBanner state="reconnecting" />
    </div>
  ),
};
