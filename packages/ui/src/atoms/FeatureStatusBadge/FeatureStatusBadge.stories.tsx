import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureStatusBadge } from './FeatureStatusBadge';

const meta: Meta<typeof FeatureStatusBadge> = {
  title: 'Atoms/FeatureStatusBadge',
  component: FeatureStatusBadge,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof FeatureStatusBadge>;

export const Active: Story = {
  args: { status: 'active' },
};

export const ComingSoon: Story = {
  args: { status: 'coming_soon' },
};

export const Planned: Story = {
  args: { status: 'planned' },
};

export const Deprecated: Story = {
  args: { status: 'deprecated' },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-2">
      <FeatureStatusBadge status="active" />
      <FeatureStatusBadge status="coming_soon" />
      <FeatureStatusBadge status="planned" />
      <FeatureStatusBadge status="deprecated" />
    </div>
  ),
};
