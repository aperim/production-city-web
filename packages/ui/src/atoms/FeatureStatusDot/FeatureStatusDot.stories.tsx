import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureStatusDot } from './FeatureStatusDot';

const meta: Meta<typeof FeatureStatusDot> = {
  title: 'Atoms/FeatureStatusDot',
  component: FeatureStatusDot,
  argTypes: {
    status: { control: 'select', options: ['active', 'coming_soon', 'disabled'] },
  },
};
export default meta;
type Story = StoryObj<typeof FeatureStatusDot>;

export const Active: Story = { args: { status: 'active' } };
export const ComingSoon: Story = { args: { status: 'coming_soon' } };
export const Disabled: Story = { args: { status: 'disabled' } };
export const AllStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <FeatureStatusDot status="active" />
        <span className="text-sm">Active</span>
      </div>
      <div className="flex items-center gap-1.5">
        <FeatureStatusDot status="coming_soon" />
        <span className="text-sm">Coming soon</span>
      </div>
      <div className="flex items-center gap-1.5">
        <FeatureStatusDot status="disabled" />
        <span className="text-sm">Disabled</span>
      </div>
    </div>
  ),
};
