import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkspaceTabs } from './WorkspaceTabs';

const meta: Meta<typeof WorkspaceTabs> = {
  title: 'Organisms/WorkspaceTabs',
  component: WorkspaceTabs,
};
export default meta;
type Story = StoryObj<typeof WorkspaceTabs>;

const productionTabs = [
  { id: 'overview', label: 'Overview', path: '/dashboard/productions/overview' },
  { id: 'shooting', label: 'Shooting', path: '/dashboard/productions/shooting', status: 'active' as const },
  { id: 'post', label: 'Post-Production', path: '/dashboard/productions/post', status: 'active' as const },
  { id: 'vfx', label: 'VFX Pipeline', path: '/dashboard/productions/vfx', status: 'coming_soon' as const },
  { id: 'archive', label: 'Archive', path: '/dashboard/productions/archive', status: 'disabled' as const },
];

export const Default: Story = {
  args: {
    tabs: productionTabs,
    activeTab: 'overview',
  },
};

export const WithActiveShoot: Story = {
  args: {
    tabs: productionTabs,
    activeTab: 'shooting',
  },
};

export const FewTabs: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview', path: '/dashboard/finance/overview' },
      { id: 'invoices', label: 'Invoices', path: '/dashboard/finance/invoices' },
    ],
    activeTab: 'overview',
  },
};
