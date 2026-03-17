import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkspaceCard } from './WorkspaceCard';

const meta: Meta<typeof WorkspaceCard> = {
  title: 'Molecules/WorkspaceCard',
  component: WorkspaceCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof WorkspaceCard>;

const baseArgs = {
  onNavigate: (path: string) => console.log('Navigate:', path),
};

export const WithStats: Story = {
  args: {
    ...baseArgs,
    workspace: { id: 'productions', label: 'Productions', icon: 'film', description: 'Film production' },
    stats: [{ label: 'Active', value: '3' }, { label: 'In Post', value: '1' }],
    activeFeatureCount: 8,
    upcomingFeatureCount: 15,
    tabs: [
      { id: 'overview', label: 'Overview', status: 'active' },
      { id: 'shooting', label: 'Shooting', status: 'coming_soon' },
      { id: 'workflow', label: 'Workflow', status: 'planned' },
    ],
    primaryAction: { label: 'My Productions', onClick: () => console.log('action') },
  },
};

export const WithoutStats: Story = {
  args: {
    ...baseArgs,
    workspace: { id: 'events', label: 'Events', icon: 'calendar', description: 'Event management' },
    stats: [],
    activeFeatureCount: 2,
    upcomingFeatureCount: 8,
    tabs: [{ id: 'overview', label: 'Overview', status: 'active' }],
  },
};

export const Loading: Story = {
  args: {
    ...baseArgs,
    workspace: { id: 'finance', label: 'Finance', icon: 'banknote', description: 'Financial operations' },
    stats: [],
    activeFeatureCount: 0,
    upcomingFeatureCount: 0,
    tabs: [],
  },
};

export const AllWorkspaces: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[
        { id: 'productions', label: 'Productions', icon: 'film' },
        { id: 'people', label: 'People & Crew', icon: 'users' },
        { id: 'facilities', label: 'Facilities', icon: 'building' },
        { id: 'finance', label: 'Finance', icon: 'banknote' },
        { id: 'events', label: 'Events', icon: 'calendar' },
      ].map((ws) => (
        <WorkspaceCard
          key={ws.id}
          workspace={{ ...ws, description: '' }}
          stats={[{ label: 'Items', value: '5' }]}
          activeFeatureCount={3}
          upcomingFeatureCount={7}
          tabs={[{ id: 'overview', label: 'Overview', status: 'active' }]}
          onNavigate={(path) => console.log('Navigate:', path)}
        />
      ))}
    </div>
  ),
};
