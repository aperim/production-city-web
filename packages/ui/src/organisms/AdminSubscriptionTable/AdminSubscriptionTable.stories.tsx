import type { Meta, StoryObj } from "@storybook/react-vite";
import { AdminSubscriptionTable } from "./AdminSubscriptionTable";
import type { AdminSubscription } from "../../types/announcements";

const meta = {
  title: "Organisms/AdminSubscriptionTable",
  component: AdminSubscriptionTable,
  tags: ["autodocs"],
} satisfies Meta<typeof AdminSubscriptionTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const subs: AdminSubscription[] = [
  { id: "s1", categoryId: "c1", channel: "email", status: "confirmed", userName: "Alice Smith", email: "alice@example.com", phone: "+61412345678", createdAt: "2026-03-10T00:00:00Z", categoryName: "Facilities" },
  { id: "s2", categoryId: "c2", channel: "sms", status: "pending", userName: "Bob Jones", email: "bob@example.com", phone: "+61498765432", createdAt: "2026-03-11T00:00:00Z", categoryName: "Events" },
  { id: "s3", categoryId: "c1", channel: "email", status: "declined", userName: "Charlie Lee", email: "charlie@example.com", phone: null, createdAt: "2026-03-08T00:00:00Z", categoryName: "Facilities" },
  { id: "s4", categoryId: "c3", channel: "email", status: "expired", userName: "Diana Chen", email: "diana@example.com", phone: "+61455551234", createdAt: "2026-03-05T00:00:00Z", categoryName: "Maintenance" },
];

export const Default: Story = {
  args: {
    subscriptions: subs,
    onRemove: () => {},
    filters: {},
    onFilter: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
  },
};

export const Empty: Story = {
  args: {
    subscriptions: [],
    onRemove: () => {},
    filters: {},
    onFilter: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
  },
};

export const FilteredByCategory: Story = {
  args: {
    subscriptions: subs.filter((s) => s.categoryName === "Facilities"),
    onRemove: () => {},
    filters: { category: "facilities" },
    onFilter: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
  },
};

export const FilteredByStatus: Story = {
  args: {
    subscriptions: subs.filter((s) => s.status === "confirmed"),
    onRemove: () => {},
    filters: { status: "confirmed" },
    onFilter: () => {},
    pagination: { page: 1, totalPages: 1, onPageChange: () => {} },
  },
};

export const PhoneNumbersMasked: Story = {
  args: Default.args,
};
