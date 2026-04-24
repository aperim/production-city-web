import type { Meta, StoryObj } from "@storybook/react-vite";
import { NetworkStatusChip } from "./NetworkStatusChip";

const meta = {
  title: "Atoms/NetworkStatusChip",
  component: NetworkStatusChip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0A0A0A" }],
    },
  },
} satisfies Meta<typeof NetworkStatusChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lead: Story = {
  args: { label: "Sydney · Leading candidate", status: "lead" },
};

export const Active: Story = {
  args: { label: "Switzerland · Europe", status: "active" },
};

export const Assess: Story = {
  args: { label: "Africa · Assessment", status: "assess" },
};

export const Follow: Story = {
  args: { label: "United States · Follows", status: "follow" },
};

export const AllStatuses: Story = {
  args: { label: "All statuses", status: "active" },
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
      <NetworkStatusChip label="Sydney · Leading candidate" status="lead" />
      <NetworkStatusChip label="Switzerland · Europe" status="active" />
      <NetworkStatusChip label="Singapore · APAC" status="active" />
      <NetworkStatusChip label="Africa · Assessment" status="assess" />
      <NetworkStatusChip label="United States · Follows" status="follow" />
    </div>
  ),
};
