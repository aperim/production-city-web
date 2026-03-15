import type { Meta, StoryObj } from "@storybook/react-vite";
import { SessionList } from "./SessionList";

const meta = {
  title: "Molecules/SessionList",
  component: SessionList,
  tags: ["autodocs"],
} satisfies Meta<typeof SessionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = new Date().toISOString();
const hourAgo = new Date(Date.now() - 3600000).toISOString();
const dayAgo = new Date(Date.now() - 86400000).toISOString();

export const WithMultipleSessions: Story = {
  args: {
    sessions: [
      { id: "1", browser: "Chrome 133", os: "macOS 15.3", createdAt: dayAgo, lastActiveAt: now, isCurrent: true },
      { id: "2", browser: "Firefox 130", os: "Windows 10+", createdAt: dayAgo, lastActiveAt: hourAgo, isCurrent: false },
      { id: "3", browser: "Safari 18", os: "iOS 18", createdAt: dayAgo, lastActiveAt: dayAgo, isCurrent: false },
    ],
    onRevoke: async (id: string) => {
      await new Promise((r) => setTimeout(r, 500));
      console.log("Revoked:", id);
    },
  },
};

export const SingleSession: Story = {
  args: {
    sessions: [
      { id: "1", browser: "Chrome 133", os: "macOS 15.3", createdAt: now, lastActiveAt: now, isCurrent: true },
    ],
    onRevoke: async () => {},
  },
};

export const Empty: Story = {
  args: {
    sessions: [],
    onRevoke: async () => {},
  },
};
