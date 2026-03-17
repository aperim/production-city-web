import type { Meta, StoryObj } from '@storybook/react-vite';
import { InboxFeed, type InboxFeedItem, type InboxFilters } from './InboxFeed';

const meta: Meta<typeof InboxFeed> = {
  title: 'Organisms/InboxFeed',
  component: InboxFeed,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InboxFeed>;

const handlers = {
  onMarkRead: (id: string) => console.log('Mark read:', id),
  onDismiss: (id: string) => console.log('Dismiss:', id),
  onLoadMore: () => console.log('Load more'),
  onNavigate: (path: string) => console.log('Navigate:', path),
  onFilterChange: (f: InboxFilters) => console.log('Filter:', f),
};

const sampleItems: InboxFeedItem[] = [
  { id: '1', type: 'approval', summary: 'Invoice #1234 needs your approval', workspace: 'finance', sourceUrl: '/dashboard/finance', priority: 'action', read: false, dismissed: false, actionable: true, createdAt: new Date().toISOString() },
  { id: '2', type: 'mention', summary: 'You were mentioned in Production Alpha', workspace: 'productions', sourceUrl: '/dashboard/productions', priority: 'info', read: true, dismissed: false, actionable: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', type: 'system', summary: 'System maintenance scheduled tonight', workspace: null, sourceUrl: '/dashboard/admin', priority: 'urgent', read: false, dismissed: false, actionable: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
];

export const WithItems: Story = {
  args: {
    items: sampleItems,
    loading: false,
    totalUnread: 2,
    totalActionable: 1,
    hasMore: false,
    activeFilters: {},
    ...handlers,
  },
};

export const Empty: Story = {
  args: {
    items: [],
    loading: false,
    totalUnread: 0,
    totalActionable: 0,
    hasMore: false,
    activeFilters: {},
    ...handlers,
  },
};

export const Loading: Story = {
  args: {
    items: [],
    loading: true,
    totalUnread: 0,
    totalActionable: 0,
    hasMore: false,
    activeFilters: {},
    ...handlers,
  },
};

export const WithPagination: Story = {
  args: {
    items: sampleItems,
    loading: false,
    totalUnread: 5,
    totalActionable: 2,
    hasMore: true,
    activeFilters: {},
    ...handlers,
  },
};
