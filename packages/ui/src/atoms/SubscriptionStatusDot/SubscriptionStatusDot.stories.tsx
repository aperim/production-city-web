import type { Meta, StoryObj } from "@storybook/react-vite";
import { SubscriptionStatusDot } from "./SubscriptionStatusDot";

const meta = {
  title: "Atoms/SubscriptionStatusDot",
  component: SubscriptionStatusDot,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["pending", "confirmed", "declined", "expired"],
    },
  },
} satisfies Meta<typeof SubscriptionStatusDot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: { status: "pending" },
};

export const Confirmed: Story = {
  args: { status: "confirmed" },
};

export const Declined: Story = {
  args: { status: "declined" },
};

export const Expired: Story = {
  args: { status: "expired" },
};
