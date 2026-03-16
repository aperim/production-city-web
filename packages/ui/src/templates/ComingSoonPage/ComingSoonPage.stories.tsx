import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComingSoonPage } from './ComingSoonPage';

const meta: Meta<typeof ComingSoonPage> = {
  title: 'Templates/ComingSoonPage',
  component: ComingSoonPage,
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
type Story = StoryObj<typeof ComingSoonPage>;

const relatedFeatures = [
  { id: 'company_ops.hr.org_chart', label: 'Organisation Chart', status: 'planned' as const, targetQuarter: 'Q4 2026', path: '/dashboard/company/hr/org-chart' },
  { id: 'company_ops.hr.recruitment', label: 'Recruitment Pipeline', status: 'coming_soon' as const, targetQuarter: 'Q3 2026', path: '/dashboard/company/hr/recruitment' },
];

export const ComingSoon: Story = {
  args: {
    feature: {
      id: 'company_ops.hr.directory',
      label: 'Team Directory',
      description: 'Employee directory with profiles, contact details, department, role, reporting line',
      status: 'coming_soon',
      targetQuarter: 'Q3 2026',
      priority: 'p2',
      phase: 'company_formation',
    },
    relatedFeatures,
    onNotifyMe: async () => new Promise((r) => setTimeout(r, 1000)),
  },
};

export const Planned: Story = {
  args: {
    feature: {
      id: 'company_ops.hr.succession',
      label: 'Succession Planning',
      description: 'Key person risk identification, succession plans, talent pipeline',
      status: 'planned',
      targetQuarter: null,
      priority: 'p3',
      phase: 'company_formation',
    },
    onNotifyMe: async () => new Promise((r) => setTimeout(r, 1000)),
  },
};

export const WithoutRelatedFeatures: Story = {
  args: {
    feature: {
      id: 'admin.audit.logs',
      label: 'Audit Log',
      description: 'Comprehensive audit trail of all system actions',
      status: 'coming_soon',
      targetQuarter: 'Q2 2026',
      priority: 'p1',
      phase: 'company_formation',
    },
    onNotifyMe: async () => new Promise((r) => setTimeout(r, 1000)),
  },
};

export const AlreadySubscribed: Story = {
  args: {
    feature: {
      id: 'company_ops.hr.directory',
      label: 'Team Directory',
      description: 'Employee directory with profiles, contact details',
      status: 'coming_soon',
      targetQuarter: 'Q3 2026',
      priority: 'p2',
      phase: 'company_formation',
    },
    relatedFeatures,
    onNotifyMe: async () => {},
    notifyMeState: 'subscribed',
  },
};

export const ErrorState: Story = {
  args: {
    feature: {
      id: 'company_ops.hr.directory',
      label: 'Team Directory',
      description: 'Employee directory with profiles, contact details',
      status: 'coming_soon',
      targetQuarter: 'Q3 2026',
      priority: 'p2',
      phase: 'company_formation',
    },
    onNotifyMe: async () => { throw new Error('Network error'); },
    notifyMeState: 'error',
  },
};
