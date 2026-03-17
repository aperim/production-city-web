import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComingSoonScaffold } from './ComingSoonScaffold';

const meta: Meta<typeof ComingSoonScaffold> = {
  title: 'Templates/ComingSoonScaffold',
  component: ComingSoonScaffold,
};
export default meta;
type Story = StoryObj<typeof ComingSoonScaffold>;

export const Default: Story = {
  args: {
    featureId: 'productions.shooting.shoot_scheduling',
    featureName: 'Shoot Scheduling',
    description: 'Plan and manage shooting schedules with crew assignments and location bookings.',
    status: 'coming_soon',
    targetQuarter: 'Q3 2026',
    wireframeType: 'calendar',
    subscribeState: 'idle',
    relatedFeatures: [
      { id: 'overview', label: 'Overview', path: '/dashboard/productions/overview' },
      { id: 'team', label: 'Team', path: '/dashboard/productions/team' },
    ],
  },
};

export const PlannedStatus: Story = {
  args: {
    featureId: 'productions.vfx.compositing',
    featureName: 'VFX Compositing',
    description: 'Visual effects compositing pipeline with multi-layer support.',
    status: 'planned',
    targetQuarter: null,
    wireframeType: 'board',
    subscribeState: 'idle',
    relatedFeatures: [],
  },
};

export const SubscribedState: Story = {
  args: {
    featureId: 'finance.invoicing.auto_reconciliation',
    featureName: 'Auto Reconciliation',
    description: 'Automatically reconcile invoices against purchase orders.',
    status: 'coming_soon',
    targetQuarter: 'Q4 2026',
    wireframeType: 'table',
    subscribeState: 'subscribed',
    relatedFeatures: [
      { id: 'invoices', label: 'Invoices', path: '/dashboard/finance/invoices' },
    ],
  },
};

export const TimelineWireframe: Story = {
  args: {
    featureId: 'productions.timeline.gantt',
    featureName: 'Gantt View',
    description: 'Timeline view with Gantt chart for project scheduling and dependency tracking.',
    status: 'coming_soon',
    targetQuarter: 'Q3 2026',
    wireframeType: 'timeline',
    subscribeState: 'idle',
    relatedFeatures: [
      { id: 'tasks', label: 'Tasks', path: '/dashboard/productions/tasks' },
      { id: 'milestones', label: 'Milestones', path: '/dashboard/productions/milestones' },
    ],
  },
};

export const ChartsWireframe: Story = {
  args: {
    featureId: 'analytics.reporting.advanced',
    featureName: 'Advanced Reporting',
    description: 'Custom reports with charts, metrics, and export capabilities.',
    status: 'planned',
    wireframeType: 'charts',
    subscribeState: 'idle',
  },
};

export const DocumentWireframe: Story = {
  args: {
    featureId: 'productions.docs.contracts',
    featureName: 'Contract Management',
    description: 'Manage contracts, agreements, and legal documents.',
    status: 'coming_soon',
    targetQuarter: 'Q4 2026',
    wireframeType: 'document',
    subscribeState: 'idle',
    relatedFeatures: [
      { id: 'documents', label: 'Documents', path: '/dashboard/productions/documents' },
    ],
  },
};

export const CatalogWireframe: Story = {
  args: {
    featureId: 'assets.inventory.catalog',
    featureName: 'Asset Catalog',
    description: 'Browse and manage production assets in a visual catalog.',
    status: 'coming_soon',
    targetQuarter: 'Q3 2026',
    wireframeType: 'catalog',
    subscribeState: 'idle',
  },
};

export const FormWireframe: Story = {
  args: {
    featureId: 'hr.onboarding.intake',
    featureName: 'Onboarding Intake',
    description: 'Employee onboarding intake forms with document collection.',
    status: 'planned',
    wireframeType: 'form',
    subscribeState: 'idle',
  },
};
