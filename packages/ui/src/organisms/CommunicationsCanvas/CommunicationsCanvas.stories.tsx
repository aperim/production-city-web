import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CommunicationsCanvas, type CommunicationsView } from "./CommunicationsCanvas";

const meta: Meta<typeof CommunicationsCanvas> = {
  title: "Organisms/CommunicationsCanvas",
  component: CommunicationsCanvas,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof CommunicationsCanvas>;

const mockContent = {
  announcementsContent: <div className="p-4">Announcements table content</div>,
  categoriesContent: <div className="p-4">Categories management content</div>,
  tagsContent: <div className="p-4">Tags management content</div>,
  subscriptionsContent: <div className="p-4">Subscriptions management content</div>,
};

function Controlled(props: Partial<React.ComponentProps<typeof CommunicationsCanvas>>) {
  const [view, setView] = useState<CommunicationsView>("announcements");
  return (
    <CommunicationsCanvas
      {...mockContent}
      hasPermission={() => true}
      activeView={view}
      onTabChange={setView}
      {...props}
    />
  );
}

export const Default: Story = {
  render: () => <Controlled />,
};

export const CategoriesActive: Story = {
  render: () => {
    const [view, setView] = useState<CommunicationsView>("categories");
    return (
      <CommunicationsCanvas
        {...mockContent}
        hasPermission={() => true}
        activeView={view}
        onTabChange={setView}
      />
    );
  },
};

export const Loading: Story = {
  render: () => <Controlled loading />,
};

export const Error: Story = {
  render: () => <Controlled error="Failed to load communications data." />,
};

export const Empty: Story = {
  render: () => <Controlled empty />,
};

export const AccessDenied: Story = {
  render: () => <Controlled accessDenied />,
};

export const PartialPermissions: Story = {
  render: () => (
    <Controlled hasPermission={(p) => p === "announcement:read_admin" || p === "tag:manage"} />
  ),
};
