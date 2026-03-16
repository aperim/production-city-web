import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComingSoonCard } from './ComingSoonCard';

const meta: Meta<typeof ComingSoonCard> = {
  title: 'Molecules/ComingSoonCard',
  component: ComingSoonCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ComingSoonCard>;

export const ComingSoon: Story = {
  args: {
    id: 'hr-directory',
    label: 'Team Directory',
    description: 'Employee directory with profiles, contact details, department, role, reporting line',
    status: 'coming_soon',
    targetQuarter: 'Q3 2026',
    priority: 'p2',
    path: '/dashboard/company/hr/directory',
  },
};

export const Planned: Story = {
  args: {
    id: 'org-chart',
    label: 'Organisation Chart',
    description: 'Visual org chart with reporting lines, departments, teams',
    status: 'planned',
    priority: 'p3',
    path: '/dashboard/company/hr/org-chart',
  },
};

export const WithoutTargetDate: Story = {
  args: {
    id: 'succession',
    label: 'Succession Planning',
    description: 'Key person risk identification, succession plans, talent pipeline',
    status: 'planned',
    priority: 'p3',
    path: '/dashboard/company/hr/succession',
  },
};

export const P1Priority: Story = {
  args: {
    id: 'cap-table',
    label: 'Cap Table',
    description: 'Share register, equity ownership, option pool, ESOP management, dilution modelling',
    status: 'coming_soon',
    targetQuarter: 'Q2 2026',
    priority: 'p1',
    path: '/dashboard/company/capital/cap-table',
  },
};

export const LongDescription: Story = {
  args: {
    id: 'privacy',
    label: 'Privacy & Data Protection',
    description: 'Privacy Act compliance, APP obligations, data breach notification, privacy impact assessments, GDPR for EU expansion, cross-border data flow, consent management, data retention policies',
    status: 'coming_soon',
    targetQuarter: 'Q4 2026',
    priority: 'p2',
    path: '/dashboard/company/legal/privacy',
  },
};
