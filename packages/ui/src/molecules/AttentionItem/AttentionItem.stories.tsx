import type { Meta, StoryObj } from '@storybook/react-vite';
import { AttentionItem } from './AttentionItem';

const meta: Meta<typeof AttentionItem> = {
  title: 'Molecules/AttentionItem',
  component: AttentionItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AttentionItem>;

const handlers = {
  onMarkRead: (id: string) => console.log('Mark read:', id),
  onDismiss: (id: string) => console.log('Dismiss:', id),
  onNavigate: (url: string) => console.log('Navigate:', url),
};

export const Unread: Story = {
  args: {
    id: '1',
    type: 'approval',
    summary: 'Invoice #1234 needs your approval',
    workspace: 'finance',
    sourceUrl: '/dashboard/finance/invoices',
    priority: 'action',
    read: false,
    ...handlers,
  },
};

export const Read: Story = {
  args: {
    id: '2',
    type: 'mention',
    summary: 'You were mentioned in Production Alpha',
    workspace: 'productions',
    sourceUrl: '/dashboard/productions/overview',
    priority: 'info',
    read: true,
    ...handlers,
  },
};

export const Urgent: Story = {
  args: {
    id: '3',
    type: 'system',
    summary: 'System maintenance in 30 minutes',
    workspace: null,
    sourceUrl: '/dashboard/administration/health',
    priority: 'urgent',
    read: false,
    ...handlers,
  },
};
