import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlannedSection } from './PlannedSection';

const meta: Meta<typeof PlannedSection> = {
  title: 'Organisms/PlannedSection',
  component: PlannedSection,
};
export default meta;
type Story = StoryObj<typeof PlannedSection>;

const makeFeatures = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    featureId: `feat.${i}`,
    label: `Feature ${i + 1}`,
    description: `Description for feature ${i + 1} with details about what it does.`,
    status: i % 2 === 0 ? 'coming_soon' as const : 'planned' as const,
    targetQuarter: i % 2 === 0 ? 'Q3 2026' : null,
    onNotify: () => {},
  }));

export const CollapsedDefault: Story = {
  args: {
    workspaceId: 'productions',
    features: makeFeatures(4),
  },
};

export const ExpandedFew: Story = {
  args: {
    workspaceId: 'productions-few',
    features: makeFeatures(3),
  },
};

export const ExpandedWithOverflow: Story = {
  args: {
    workspaceId: 'productions-overflow',
    features: makeFeatures(10),
  },
};

export const Empty: Story = {
  args: {
    workspaceId: 'empty',
    features: [],
  },
};
