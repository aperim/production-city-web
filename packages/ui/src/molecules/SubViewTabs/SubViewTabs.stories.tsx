import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { SubViewTabs, type SubViewTab } from "./SubViewTabs";

const meta: Meta<typeof SubViewTabs> = {
  title: "Molecules/SubViewTabs",
  component: SubViewTabs,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SubViewTabs>;

const baseTabs: SubViewTab[] = [
  { id: "announcements", label: "Announcements" },
  { id: "categories", label: "Categories" },
  { id: "tags", label: "Tags" },
  { id: "subscriptions", label: "Subscriptions" },
];

function SubViewTabsControlled({ tabs, ...props }: { tabs: SubViewTab[]; hasPermission?: (p: string) => boolean }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  return <SubViewTabs tabs={tabs} activeTab={active} onTabChange={setActive} {...props} />;
}

export const Default: Story = {
  render: () => <SubViewTabsControlled tabs={baseTabs} />,
};

export const WithBadges: Story = {
  render: () => (
    <SubViewTabsControlled
      tabs={[
        { id: "announcements", label: "Announcements", badge: 12 },
        { id: "categories", label: "Categories", badge: 5 },
        { id: "tags", label: "Tags", badge: 23 },
        { id: "subscriptions", label: "Subscriptions", badge: 140 },
      ]}
    />
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <SubViewTabsControlled
      tabs={Array.from({ length: 10 }, (_, i) => ({
        id: `tab-${i}`,
        label: `Sub-view ${i + 1}`,
      }))}
    />
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <SubViewTabsControlled tabs={[{ id: "first", label: "First" }, { id: "second", label: "Second" }]} />
  ),
};

export const PermissionFiltered: Story = {
  render: () => (
    <SubViewTabsControlled
      tabs={[
        { id: "announcements", label: "Announcements", permission: "announcement:read_admin" },
        { id: "categories", label: "Categories", permission: "category:manage" },
        { id: "tags", label: "Tags" },
        { id: "subscriptions", label: "Subscriptions", permission: "subscription:manage" },
      ]}
      hasPermission={(p) => p === "announcement:read_admin"}
    />
  ),
};

export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <SubViewTabsControlled
      tabs={[
        { id: "announcements", label: "Announcements", badge: 12 },
        { id: "categories", label: "Categories", badge: 5 },
        { id: "tags", label: "Tags" },
        { id: "subscriptions", label: "Subscriptions" },
      ]}
    />
  ),
};
