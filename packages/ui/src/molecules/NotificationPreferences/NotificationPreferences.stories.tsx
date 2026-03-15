import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationPreferences } from "./NotificationPreferences";

const meta = {
  title: "Molecules/NotificationPreferences",
  component: NotificationPreferences,
  tags: ["autodocs"],
} satisfies Meta<typeof NotificationPreferences>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultPreferences = [
  { channel: "admin:eoi", label: "New expressions of interest", enabled: true },
  { channel: "admin:approvals", label: "Approval requests", enabled: true },
  { channel: "admin:notifications", label: "General notifications", enabled: false },
  { channel: "admin:audit", label: "Audit log events", enabled: true },
];

export const Default: Story = {
  args: {
    preferences: defaultPreferences,
  },
};

export const AllDisabled: Story = {
  args: {
    preferences: defaultPreferences.map((p) => ({ ...p, enabled: false })),
  },
};

export const Saving: Story = {
  args: {
    preferences: defaultPreferences,
    saving: true,
  },
};
