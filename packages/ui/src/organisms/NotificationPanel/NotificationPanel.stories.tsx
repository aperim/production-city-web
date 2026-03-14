import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationPanel } from "./NotificationPanel";

const sampleNotifications = [
  { id: "1", message: "New Producer expression of interest", timestamp: "Just now", read: false },
  { id: "2", message: "New user waiting for approval", timestamp: "2 min ago", read: false, actionLabel: "View" },
  { id: "3", message: "User approval processed", timestamp: "1 hr ago", read: true },
  { id: "4", message: "Email delivered", timestamp: "2 hr ago", read: true },
];

const meta = {
  title: "Organisms/NotificationPanel",
  component: NotificationPanel,
  tags: ["autodocs"],
} satisfies Meta<typeof NotificationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {
  args: { notifications: sampleNotifications, onMarkAllRead: () => {} },
};

export const Empty: Story = {
  args: { notifications: [] },
};

export const Loading: Story = {
  args: { notifications: [], loading: true },
};

export const AllRead: Story = {
  args: {
    notifications: sampleNotifications.map((n) => ({ ...n, read: true })),
    onMarkAllRead: () => {},
  },
};
