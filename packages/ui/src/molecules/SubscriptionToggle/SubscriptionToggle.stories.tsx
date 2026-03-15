import type { Meta, StoryObj } from "@storybook/react-vite";
import { SubscriptionToggle } from "./SubscriptionToggle";

const meta = {
  title: "Molecules/SubscriptionToggle",
  component: SubscriptionToggle,
  tags: ["autodocs"],
} satisfies Meta<typeof SubscriptionToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

const category = { id: "1", name: "Facility Updates", slug: "facility-updates", description: "News about facility changes and improvements" };

export const NotSubscribed: Story = {
  args: {
    category,
    emailStatus: null,
    smsStatus: null,
    hasPhone: true,
    onSubscribe: () => {},
    onUnsubscribe: () => {},
    onResend: () => {},
  },
};

export const EmailPending: Story = {
  args: {
    ...NotSubscribed.args,
    emailStatus: "pending",
    emailSubscriptionId: "sub-1",
  },
};

export const EmailConfirmed: Story = {
  args: {
    ...NotSubscribed.args,
    emailStatus: "confirmed",
    emailSubscriptionId: "sub-1",
  },
};

export const SmsConfirmed: Story = {
  args: {
    ...NotSubscribed.args,
    smsStatus: "confirmed",
    smsSubscriptionId: "sub-2",
  },
};

export const BothConfirmed: Story = {
  args: {
    ...NotSubscribed.args,
    emailStatus: "confirmed",
    emailSubscriptionId: "sub-1",
    smsStatus: "confirmed",
    smsSubscriptionId: "sub-2",
  },
};

export const Loading: Story = {
  args: {
    ...NotSubscribed.args,
    loading: true,
  },
};

export const Error: Story = {
  args: {
    ...NotSubscribed.args,
    error: "Failed to update subscription. Please try again.",
  },
};

export const SmsDisabled: Story = {
  args: {
    ...NotSubscribed.args,
    hasPhone: false,
  },
};
