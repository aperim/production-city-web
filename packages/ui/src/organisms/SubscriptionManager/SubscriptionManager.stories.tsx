import type { Meta, StoryObj } from "@storybook/react-vite";
import { SubscriptionManager } from "./SubscriptionManager";
import type { Category, Subscription } from "../../types/announcements";

const meta = {
  title: "Organisms/SubscriptionManager",
  component: SubscriptionManager,
  tags: ["autodocs"],
} satisfies Meta<typeof SubscriptionManager>;

export default meta;
type Story = StoryObj<typeof meta>;

const categories: Category[] = [
  { id: "c1", name: "Facility Updates", slug: "facility-updates", description: "Changes to facilities" },
  { id: "c2", name: "Events", slug: "events", description: "Upcoming events and activities" },
  { id: "c3", name: "Maintenance", slug: "maintenance", description: "Scheduled maintenance notices" },
];

export const NoSubscriptions: Story = {
  args: {
    categories,
    subscriptions: [],
    hasPhone: true,
    onSubscribe: () => {},
    onUnsubscribe: () => {},
    onResend: () => {},
  },
};

export const PartialSubscriptions: Story = {
  args: {
    categories,
    subscriptions: [
      { id: "s1", categoryId: "c1", channel: "email", status: "confirmed" },
    ] as Subscription[],
    hasPhone: true,
    onSubscribe: () => {},
    onUnsubscribe: () => {},
    onResend: () => {},
  },
};

export const AllSubscribed: Story = {
  args: {
    categories,
    subscriptions: [
      { id: "s1", categoryId: "c1", channel: "email", status: "confirmed" },
      { id: "s2", categoryId: "c1", channel: "sms", status: "confirmed" },
      { id: "s3", categoryId: "c2", channel: "email", status: "confirmed" },
      { id: "s4", categoryId: "c2", channel: "sms", status: "confirmed" },
      { id: "s5", categoryId: "c3", channel: "email", status: "confirmed" },
      { id: "s6", categoryId: "c3", channel: "sms", status: "confirmed" },
    ] as Subscription[],
    hasPhone: true,
    onSubscribe: () => {},
    onUnsubscribe: () => {},
    onResend: () => {},
  },
};

export const Loading: Story = {
  args: { ...NoSubscriptions.args, loading: true },
};

export const EmptyCategories: Story = {
  args: {
    categories: [],
    subscriptions: [],
    hasPhone: true,
    onSubscribe: () => {},
    onUnsubscribe: () => {},
    onResend: () => {},
  },
};

export const NoPhoneNumber: Story = {
  args: { ...NoSubscriptions.args, hasPhone: false },
};

export const WithPendingSubscriptions: Story = {
  args: {
    categories,
    subscriptions: [
      { id: "s1", categoryId: "c1", channel: "email", status: "pending" },
      { id: "s2", categoryId: "c2", channel: "email", status: "pending" },
    ] as Subscription[],
    hasPhone: true,
    onSubscribe: () => {},
    onUnsubscribe: () => {},
    onResend: () => {},
  },
};
