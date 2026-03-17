import type { Meta, StoryObj } from '@storybook/react-vite';
import { RecentItem } from './RecentItem';

const meta: Meta<typeof RecentItem> = {
  title: 'Molecules/RecentItem',
  component: RecentItem,
};
export default meta;
type Story = StoryObj<typeof RecentItem>;

export const Default: Story = {
  args: {
    label: 'Shooting — Productions',
    path: '/dashboard/productions/shooting',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    onClick: (path) => console.log('navigate', path),
  },
};
export const Recent: Story = {
  args: {
    ...Default.args,
    label: 'Invoices — Finance',
    path: '/dashboard/finance/invoices',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
};
export const OldItem: Story = {
  args: {
    ...Default.args,
    label: 'Calendar — Facilities',
    path: '/dashboard/facilities/calendar',
    timestamp: new Date(Date.now() - 604800000).toISOString(),
  },
};
