import type { Meta, StoryObj } from '@storybook/react-vite';
import { TabItem } from './TabItem';

const meta: Meta<typeof TabItem> = {
  title: 'Atoms/TabItem',
  component: TabItem,
  argTypes: {
    status: { control: 'select', options: ['active', 'coming_soon', 'disabled', undefined] },
  },
};
export default meta;
type Story = StoryObj<typeof TabItem>;

export const Default: Story = { args: { label: 'Overview' } };
export const Active: Story = { args: { label: 'Overview', active: true } };
export const WithStatusActive: Story = { args: { label: 'Shooting', status: 'active', active: true } };
export const WithStatusComingSoon: Story = { args: { label: 'VFX Pipeline', status: 'coming_soon' } };
export const WithStatusDisabled: Story = { args: { label: 'Archive', status: 'disabled' } };
