import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkspaceSidebar } from './WorkspaceSidebar';

const meta: Meta<typeof WorkspaceSidebar> = {
  title: 'Organisms/WorkspaceSidebar',
  component: WorkspaceSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen">
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof WorkspaceSidebar>;

const workspaces = [
  { id: 'productions', label: 'Productions', icon: 'film', path: '/dashboard/productions' },
  { id: 'finance', label: 'Finance', icon: 'dollar-sign', path: '/dashboard/finance' },
  { id: 'facilities', label: 'Facilities', icon: 'building', path: '/dashboard/facilities' },
  { id: 'hr', label: 'People & Culture', icon: 'users', path: '/dashboard/hr' },
  { id: 'education', label: 'Education', icon: 'graduation-cap', path: '/dashboard/education' },
];

const recents = [
  { label: 'Shooting — Productions', path: '/dashboard/productions/shooting', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { label: 'Invoices — Finance', path: '/dashboard/finance/invoices', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { label: 'Calendar — Facilities', path: '/dashboard/facilities/calendar', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

export const Default: Story = {
  args: {
    workspaces,
    activeWorkspace: 'productions',
    inboxCount: 3,
    recents,
  },
};

export const Collapsed: Story = {
  args: {
    workspaces,
    collapsed: true,
    inboxCount: 12,
  },
};

export const NoRecents: Story = {
  args: {
    workspaces,
    activeWorkspace: 'finance',
    inboxCount: 0,
  },
};

export const HighInboxCount: Story = {
  args: {
    workspaces,
    inboxCount: 150,
    recents,
  },
};
