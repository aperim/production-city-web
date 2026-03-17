import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeCount } from './BadgeCount';

const meta: Meta<typeof BadgeCount> = {
  title: 'Atoms/BadgeCount',
  component: BadgeCount,
};
export default meta;
type Story = StoryObj<typeof BadgeCount>;

export const Default: Story = { args: { count: 3 } };
export const HighCount: Story = { args: { count: 150 } };
export const Zero: Story = { args: { count: 0 } };
export const SingleDigit: Story = { args: { count: 9 } };
export const DoubleDigit: Story = { args: { count: 42 } };
