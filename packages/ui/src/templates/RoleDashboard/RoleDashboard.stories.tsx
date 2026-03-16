import type { Meta, StoryObj } from '@storybook/react-vite';
import { RoleDashboard, type KpiCard, type QuickAction, type ActivityEntry } from './RoleDashboard';

const meta: Meta<typeof RoleDashboard> = {
  title: 'Templates/RoleDashboard',
  component: RoleDashboard,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="bg-background min-h-screen">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RoleDashboard>;

const sampleKpiCards: KpiCard[] = [
  { label: 'Total Users', value: '1,423', change: '+12%', trend: 'up' },
  { label: 'Active Sessions', value: '384', change: '-3%', trend: 'down' },
  { label: 'Open Issues', value: '7', trend: 'neutral' },
];

const sampleQuickActions: QuickAction[] = [
  { label: 'Invite User', href: '/dashboard/admin/users/invitations' },
  { label: 'View Approvals', href: '/dashboard/admin/users/approvals' },
  { label: 'System Settings', href: '/dashboard/admin/settings' },
];

const sampleActivities: ActivityEntry[] = [
  { id: '1', message: 'User admin@production.city signed in', timestamp: '2 min ago' },
  { id: '2', message: 'New invitation sent to user@example.com', timestamp: '15 min ago' },
  { id: '3', message: 'Role updated for partner@example.com', timestamp: '1 hour ago' },
  { id: '4', message: 'Feature flag dashboard.analytics enabled', timestamp: '3 hours ago' },
];

// --- Full dashboard for each role ---

export const Admin: Story = {
  args: {
    userName: 'Alice Chen',
    role: 'admin',
    kpiCards: sampleKpiCards,
    quickActions: sampleQuickActions,
    activities: sampleActivities,
  },
};

export const Executive: Story = {
  args: {
    userName: 'James Wilson',
    role: 'executive',
    kpiCards: [
      { label: 'Revenue', value: '$2.4M', change: '+8%', trend: 'up' },
      { label: 'Active Projects', value: '12', change: '+2', trend: 'up' },
      { label: 'Team Utilization', value: '87%', trend: 'neutral' },
    ],
    quickActions: [
      { label: 'View Reports', href: '/dashboard/executive/reports' },
      { label: 'Board Deck', href: '/dashboard/executive/board' },
    ],
    activities: sampleActivities.slice(0, 2),
  },
};

export const Staff: Story = {
  args: {
    userName: 'Maria Garcia',
    role: 'staff',
    kpiCards: [
      { label: 'My Tasks', value: '5', trend: 'neutral' },
      { label: 'Completed Today', value: '3', change: '+1', trend: 'up' },
    ],
    quickActions: [
      { label: 'My Tasks', href: '/dashboard/staff/tasks' },
      { label: 'Time Tracking', href: '/dashboard/staff/time' },
    ],
  },
};

export const Client: Story = {
  args: {
    userName: 'Robert Kim',
    role: 'client',
    kpiCards: [
      { label: 'Active Projects', value: '3', trend: 'neutral' },
      { label: 'Pending Invoices', value: '1', trend: 'neutral' },
    ],
    quickActions: [
      { label: 'My Projects', href: '/dashboard/client/projects' },
      { label: 'Support', href: '/dashboard/client/support' },
    ],
  },
};

export const Investor: Story = {
  args: {
    userName: 'Sarah Thompson',
    role: 'investor',
    kpiCards: [
      { label: 'Portfolio Value', value: '$1.2M', change: '+4.2%', trend: 'up' },
      { label: 'Active Investments', value: '8', trend: 'neutral' },
      { label: 'Quarterly Return', value: '6.8%', change: '+1.1%', trend: 'up' },
    ],
    quickActions: [
      { label: 'Portfolio', href: '/dashboard/investor/portfolio' },
      { label: 'Reports', href: '/dashboard/investor/reports' },
    ],
  },
};

export const Guest: Story = {
  args: {
    userName: 'New User',
    role: 'guest',
  },
};

export const Vendor: Story = {
  args: {
    userName: 'TechSupply Corp',
    role: 'vendor',
    kpiCards: [
      { label: 'Open Orders', value: '4', trend: 'neutral' },
      { label: 'Pending Invoices', value: '2', trend: 'neutral' },
      { label: 'Avg Delivery Time', value: '3.2d', change: '-0.5d', trend: 'up' },
    ],
    quickActions: [
      { label: 'Orders', href: '/dashboard/vendor/orders' },
      { label: 'Invoices', href: '/dashboard/vendor/invoices' },
    ],
  },
};

export const Government: Story = {
  args: {
    userName: 'Inspector Davis',
    role: 'government',
    kpiCards: [
      { label: 'Compliance Score', value: '94%', change: '+2%', trend: 'up' },
      { label: 'Open Reports', value: '3', trend: 'neutral' },
    ],
    quickActions: [
      { label: 'Compliance Reports', href: '/dashboard/government/compliance' },
      { label: 'Policy Updates', href: '/dashboard/government/policy' },
    ],
  },
};

export const Partner: Story = {
  args: {
    userName: 'Alex Rivera',
    role: 'partner',
    kpiCards: [
      { label: 'Joint Projects', value: '6', trend: 'neutral' },
      { label: 'Shared Revenue', value: '$340K', change: '+15%', trend: 'up' },
    ],
    quickActions: [
      { label: 'Collaboration Hub', href: '/dashboard/partner/hub' },
    ],
    activities: sampleActivities.slice(0, 2),
  },
};

export const FirstNations: Story = {
  args: {
    userName: 'Elder Williams',
    role: 'first_nations',
    kpiCards: [
      { label: 'Active Programs', value: '8', trend: 'neutral' },
      { label: 'Community Reach', value: '2,400', change: '+18%', trend: 'up' },
    ],
    quickActions: [
      { label: 'Cultural Programs', href: '/dashboard/first-nations/programs' },
      { label: 'Community Board', href: '/dashboard/first-nations/community' },
    ],
  },
};

// --- State stories ---

export const Loading: Story = {
  args: {
    userName: 'Alice Chen',
    role: 'admin',
    loading: true,
  },
};

export const LoadingWithKpiCards: Story = {
  args: {
    userName: 'Alice Chen',
    role: 'admin',
    kpiCards: sampleKpiCards,
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    userName: 'New User',
    role: 'guest',
  },
};

export const WithKpiCardsOnly: Story = {
  args: {
    userName: 'Alice Chen',
    role: 'admin',
    kpiCards: sampleKpiCards,
  },
};

export const WithQuickActionsOnly: Story = {
  args: {
    userName: 'Alice Chen',
    role: 'staff',
    quickActions: sampleQuickActions,
  },
};

export const WithActivityFeedOnly: Story = {
  args: {
    userName: 'Alice Chen',
    role: 'admin',
    activities: sampleActivities,
  },
};
