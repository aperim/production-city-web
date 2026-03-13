import type { Meta, StoryObj } from '@storybook/react-vite';
import { SuppressionBadge } from './SuppressionBadge';

const meta = {
  title: 'Molecules/SuppressionBadge',
  component: SuppressionBadge,
  tags: ['autodocs'],
  argTypes: {
    reason: { control: 'select', options: ['hard_bounce', 'spam_complaint'] },
  },
} satisfies Meta<typeof SuppressionBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HardBounce: Story = { args: { reason: 'hard_bounce' } };
export const SpamComplaint: Story = { args: { reason: 'spam_complaint' } };

export const Removable: Story = {
  args: {
    reason: 'hard_bounce',
    removable: true,
    onRemove: () => alert('Remove suppression'),
  },
};

export const AllReasons: StoryObj = {
  render: () => (
    <div className="flex gap-2">
      <SuppressionBadge reason="hard_bounce" />
      <SuppressionBadge reason="spam_complaint" />
    </div>
  ),
};
