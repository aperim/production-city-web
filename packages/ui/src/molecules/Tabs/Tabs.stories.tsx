import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "./Tabs";

const meta = {
  title: "Molecules/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  { id: "account", label: "Account", content: <div className="text-sm">Account settings and preferences.</div> },
  { id: "security", label: "Security", content: <div className="text-sm">Security settings: password, 2FA.</div> },
  { id: "billing", label: "Billing", content: <div className="text-sm">Subscription and payment methods.</div> },
];

export const Default: Story = {
  args: {
    items,
    "aria-label": "Settings sections",
  },
};

export const Vertical: Story = {
  args: {
    items,
    orientation: "vertical",
    "aria-label": "Settings sections",
  },
};

export const WithBadge: Story = {
  args: {
    items: [
      { id: "inbox", label: "Inbox", content: <div className="text-sm">3 new messages.</div>, badge: "3" },
      { id: "sent", label: "Sent", content: <div className="text-sm">Sent messages.</div> },
      { id: "archive", label: "Archive", content: <div className="text-sm">Archived messages.</div> },
    ],
    "aria-label": "Mailbox",
  },
};

export const WithDisabled: Story = {
  args: {
    items: [
      { id: "t1", label: "Overview", content: <div className="text-sm">Overview content.</div> },
      { id: "t2", label: "Analytics", content: <div className="text-sm">Analytics content.</div>, disabled: true },
      { id: "t3", label: "Reports", content: <div className="text-sm">Reports content.</div> },
    ],
    "aria-label": "Dashboard",
  },
};
