import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarItem } from './SidebarItem';

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1L1 7h2v6h4V9h2v4h4V7h2L8 1z" />
  </svg>
);

const meta: Meta<typeof SidebarItem> = {
  title: 'Atoms/SidebarItem',
  component: SidebarItem,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-56 bg-background border border-border rounded-sm p-2">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SidebarItem>;

export const Default: Story = {
  args: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <HomeIcon />,
  },
};

export const Active: Story = {
  args: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <HomeIcon />,
    isActive: true,
  },
};

export const ComingSoon: Story = {
  args: {
    id: 'hr-directory',
    label: 'Team Directory',
    path: '/dashboard/company/hr/directory',
    icon: <HomeIcon />,
    status: 'coming_soon',
  },
};

export const Planned: Story = {
  args: {
    id: 'org-chart',
    label: 'Organisation Chart',
    path: '/dashboard/company/hr/org-chart',
    icon: <HomeIcon />,
    status: 'planned',
  },
};

export const WithBadge: Story = {
  args: {
    id: 'approvals',
    label: 'Pending Approvals',
    path: '/dashboard/administration/users',
    icon: <HomeIcon />,
    badge: '3',
  },
};

export const Collapsed: Story = {
  args: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <HomeIcon />,
    collapsed: true,
  },
  decorators: [
    (Story) => (
      <div className="w-14 bg-background border border-border rounded-sm p-2">
        <Story />
      </div>
    ),
  ],
};

export const CollapsedActive: Story = {
  args: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <HomeIcon />,
    isActive: true,
    collapsed: true,
  },
  decorators: [
    (Story) => (
      <div className="w-14 bg-background border border-border rounded-sm p-2">
        <Story />
      </div>
    ),
  ],
};

export const Deprecated: Story = {
  args: {
    id: 'legacy',
    label: 'Legacy Feature',
    path: '/dashboard/legacy',
    icon: <HomeIcon />,
    status: 'deprecated',
  },
};
