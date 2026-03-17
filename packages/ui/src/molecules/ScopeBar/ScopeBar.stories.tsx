import type { Meta, StoryObj } from '@storybook/react-vite';
import { ScopeBar } from './ScopeBar';

const meta: Meta<typeof ScopeBar> = {
  title: 'Molecules/ScopeBar',
  component: ScopeBar,
};
export default meta;
type Story = StoryObj<typeof ScopeBar>;

const defaultOptions = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
];

export const Default: Story = {
  args: {
    options: defaultOptions,
    value: 'all',
  },
};

export const WithSearch: Story = {
  args: {
    options: defaultOptions,
    value: 'all',
    onSearch: (q) => console.log('search', q),
    searchPlaceholder: 'Search projects...',
  },
};

export const ActiveSelected: Story = {
  args: {
    options: defaultOptions,
    value: 'active',
  },
};
