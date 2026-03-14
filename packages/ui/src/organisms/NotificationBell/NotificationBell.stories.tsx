import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationBell } from "./NotificationBell";
import { NotificationPanel } from "../NotificationPanel/NotificationPanel";

const sampleNotifications = [
  { id: "1", message: "New EOI received", timestamp: "Just now", read: false },
  { id: "2", message: "Approval needed", timestamp: "2 min ago", read: false, actionLabel: "View" },
  { id: "3", message: "Email delivered", timestamp: "1 hr ago", read: true },
];

const meta = {
  title: "Organisms/NotificationBell",
  component: NotificationBell,
  tags: ["autodocs"],
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoNotifications: Story = {
  args: { count: 0 },
};

export const WithUnread: Story = {
  args: {
    count: 3,
    panel: <NotificationPanel notifications={sampleNotifications} onMarkAllRead={() => {}} />,
  },
};

export const PanelOpen: Story = {
  args: {
    count: 2,
    panel: <NotificationPanel notifications={sampleNotifications.slice(0, 2)} onMarkAllRead={() => {}} />,
  },
};
