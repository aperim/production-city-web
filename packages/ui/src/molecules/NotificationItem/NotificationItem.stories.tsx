import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationItem } from "./NotificationItem";

const meta = {
  title: "Molecules/NotificationItem",
  component: NotificationItem,
  tags: ["autodocs"],
  argTypes: {
    read: { control: "boolean" },
  },
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {
  args: { message: "New Producer expression of interest", timestamp: "2 min ago", read: false },
};

export const Read: Story = {
  args: { message: "User approval processed", timestamp: "1 hr ago", read: true },
};

export const WithAction: Story = {
  args: { message: "New user waiting for approval", timestamp: "Just now", read: false, actionLabel: "View", onAction: () => {} },
};

export const LongText: Story = {
  args: {
    message: "A new Creative Professional expression of interest has been submitted with detailed information about their portfolio and experience",
    timestamp: "5 min ago",
    read: false,
  },
};

export const AllStates: StoryObj = {
  render: () => (
    <div className="max-w-sm border border-border rounded-sm">
      <NotificationItem message="Unread notification" timestamp="Just now" read={false} />
      <NotificationItem message="Read notification" timestamp="1 hr ago" read />
      <NotificationItem message="With action" timestamp="2 min ago" read={false} actionLabel="Approve" onAction={() => {}} />
    </div>
  ),
};
