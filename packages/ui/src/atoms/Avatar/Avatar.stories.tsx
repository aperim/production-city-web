import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarGroup } from "./Avatar";

const meta = {
  title: "Atoms/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl"] },
    status: { control: "select", options: ["online", "offline", "busy", "away"] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInitials: Story = {
  args: { initials: "JD" },
};

export const WithImage: Story = {
  args: { src: "https://i.pravatar.cc/150?img=1", alt: "Jane Doe" },
};

export const WithIcon: Story = {
  args: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
};

export const WithStatus: Story = {
  args: { initials: "JD", status: "online", statusLabel: "Online" },
};

export const AllStatuses: StoryObj = {
  render: () => (
    <div className="flex gap-4">
      <Avatar initials="ON" status="online" statusLabel="Online" />
      <Avatar initials="OF" status="offline" statusLabel="Offline" />
      <Avatar initials="BS" status="busy" statusLabel="Busy" />
      <Avatar initials="AW" status="away" statusLabel="Away" />
    </div>
  ),
};

export const AllSizes: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar initials="XS" size="xs" />
      <Avatar initials="SM" size="sm" />
      <Avatar initials="MD" size="md" />
      <Avatar initials="LG" size="lg" />
      <Avatar initials="XL" size="xl" />
    </div>
  ),
};

export const Group: StoryObj = {
  render: () => (
    <AvatarGroup
      max={3}
      avatars={[
        { src: "https://i.pravatar.cc/150?img=1", alt: "User 1" },
        { src: "https://i.pravatar.cc/150?img=2", alt: "User 2" },
        { initials: "CC" },
        { initials: "DD" },
        { initials: "EE" },
      ]}
    />
  ),
};
