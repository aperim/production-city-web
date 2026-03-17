import type { Meta, StoryObj } from '@storybook/react-vite';
import { HomeDashboard } from './HomeDashboard';

const meta: Meta<typeof HomeDashboard> = {
  title: 'Templates/HomeDashboard',
  component: HomeDashboard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HomeDashboard>;

const nav = (p: string) => console.log('Navigate:', p);

export const AdminView: Story = {
  args: {
    attentionItems: [
      { id: '1', type: 'approval', summary: 'Invoice #1234 needs approval', workspace: 'finance', sourceUrl: '/dashboard/finance', priority: 'action', createdAt: new Date().toISOString() },
      { id: '2', type: 'system', summary: 'System maintenance tonight', workspace: 'administration', sourceUrl: '/dashboard/admin', priority: 'urgent', createdAt: new Date().toISOString() },
    ],
    recents: [
      { label: 'Overview — Productions', path: '/dashboard/productions/overview', timestamp: new Date().toISOString() },
      { label: 'Invoices — Finance', path: '/dashboard/finance/invoices', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ],
    workspaceCards: [
      { workspace: { id: 'productions', label: 'Productions', icon: 'film', description: '' }, stats: [{ label: 'Active', value: '3' }], activeFeatureCount: 5, upcomingFeatureCount: 10, tabs: [{ id: 'overview', label: 'Overview', status: 'active' }], onNavigate: nav },
      { workspace: { id: 'finance', label: 'Finance', icon: 'banknote', description: '' }, stats: [{ label: 'Open', value: '7' }], activeFeatureCount: 3, upcomingFeatureCount: 8, tabs: [{ id: 'overview', label: 'Overview', status: 'active' }], onNavigate: nav },
      { workspace: { id: 'people', label: 'People & Crew', icon: 'users', description: '' }, stats: [], activeFeatureCount: 2, upcomingFeatureCount: 12, tabs: [{ id: 'directory', label: 'Directory', status: 'active' }], onNavigate: nav },
    ],
    whatsNew: [
      { featureId: 'f1', label: 'Crew Directory', workspace: 'people', activatedAt: new Date().toISOString() },
    ],
    onNavigate: nav,
    onRecentClick: nav,
  },
};

export const GuestView: Story = {
  args: {
    attentionItems: [],
    recents: [],
    workspaceCards: [
      { workspace: { id: 'events', label: 'Events', icon: 'calendar', description: '' }, stats: [], activeFeatureCount: 1, upcomingFeatureCount: 5, tabs: [{ id: 'overview', label: 'Overview', status: 'active' }], onNavigate: nav },
    ],
    whatsNew: [],
    onNavigate: nav,
    onRecentClick: nav,
  },
};

export const EmptyState: Story = {
  args: {
    attentionItems: [],
    recents: [],
    workspaceCards: [],
    whatsNew: [],
    onNavigate: nav,
    onRecentClick: nav,
  },
};
