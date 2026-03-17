import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlannedFeatureCard } from './PlannedFeatureCard';

const meta: Meta<typeof PlannedFeatureCard> = {
  title: 'Molecules/PlannedFeatureCard',
  component: PlannedFeatureCard,
};
export default meta;
type Story = StoryObj<typeof PlannedFeatureCard>;

export const ComingSoon: Story = {
  args: {
    featureId: 'productions.shooting.shoot_scheduling',
    label: 'Shoot Scheduling',
    description: 'Plan and manage shooting schedules with crew assignments and location bookings.',
    status: 'coming_soon',
    targetQuarter: 'Q3 2026',
  },
};

export const Planned: Story = {
  args: {
    featureId: 'productions.vfx.compositing',
    label: 'VFX Compositing',
    description: 'Visual effects compositing pipeline with multi-layer support and real-time preview.',
    status: 'planned',
  },
};

export const LongDescription: Story = {
  args: {
    featureId: 'finance.invoicing.auto_reconciliation',
    label: 'Auto Reconciliation',
    description: 'Automatically reconcile invoices against purchase orders and delivery receipts. Supports multi-currency matching with configurable tolerance thresholds and exception workflows for partial deliveries.',
    status: 'coming_soon',
    targetQuarter: 'Q4 2026',
  },
};
