import type { Meta, StoryObj } from "@storybook/react-vite";
import { DeliveryStatusRow } from "./DeliveryStatusRow";

const meta: Meta<typeof DeliveryStatusRow> = {
  title: "Molecules/DeliveryStatusRow",
  component: DeliveryStatusRow,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <table className="w-full">
        <thead>
          <tr className="text-xs text-muted-foreground border-b border-border">
            <th className="px-3 py-2 text-left">Name</th>
            <th className="px-3 py-2 text-left">Channel</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Sent</th>
            <th className="px-3 py-2 text-left">Delivered</th>
            <th className="px-3 py-2 text-left">Opened</th>
          </tr>
        </thead>
        <tbody>
          <Story />
        </tbody>
      </table>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Queued: Story = {
  args: { userName: "Alice Smith", channel: "email", status: "queued", sentAt: null, deliveredAt: null, openedAt: null },
};

export const Sending: Story = {
  args: { userName: "Bob Jones", channel: "email", status: "sending", sentAt: null, deliveredAt: null, openedAt: null },
};

export const Sent: Story = {
  args: { userName: "Charlie Lee", channel: "sms", status: "sent", sentAt: "2026-03-10T10:00:00Z", deliveredAt: null, openedAt: null },
};

export const Delivered: Story = {
  args: { userName: "Diana Chen", channel: "email", status: "delivered", sentAt: "2026-03-10T10:00:00Z", deliveredAt: "2026-03-10T10:01:00Z", openedAt: null },
};

export const Opened: Story = {
  args: { userName: "Eve Park", channel: "email", status: "delivered", sentAt: "2026-03-10T10:00:00Z", deliveredAt: "2026-03-10T10:01:00Z", openedAt: "2026-03-10T10:05:00Z" },
};

export const Failed: Story = {
  args: { userName: "Frank Wu", channel: "email", status: "failed", sentAt: "2026-03-10T10:00:00Z", deliveredAt: null, openedAt: null, error: "Recipient mailbox full" },
};

export const Suppressed: Story = {
  args: { userName: "Grace Kim", channel: "email", status: "suppressed", sentAt: null, deliveredAt: null, openedAt: null },
};

export const Loading: Story = {
  args: { userName: "", channel: "email", status: "queued", sentAt: null, deliveredAt: null, openedAt: null, loading: true },
};
