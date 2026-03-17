import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkspaceShell } from './WorkspaceShell';
import { WorkspaceSidebar } from '../../organisms/WorkspaceSidebar/WorkspaceSidebar';
import { WorkspaceTabs } from '../../organisms/WorkspaceTabs/WorkspaceTabs';
import { ScopeBar } from '../../molecules/ScopeBar/ScopeBar';
import { AIPanel } from '../../organisms/AIPanel/AIPanel';

const meta: Meta<typeof WorkspaceShell> = {
  title: 'Templates/WorkspaceShell',
  component: WorkspaceShell,
  parameters: {
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj<typeof WorkspaceShell>;

const workspaces = [
  { id: 'productions', label: 'Productions', icon: 'film', path: '/dashboard/productions' },
  { id: 'finance', label: 'Finance', icon: 'dollar-sign', path: '/dashboard/finance' },
  { id: 'facilities', label: 'Facilities', icon: 'building', path: '/dashboard/facilities' },
];

const tabs = [
  { id: 'overview', label: 'Overview', path: '/dashboard/productions/overview' },
  { id: 'shooting', label: 'Shooting', path: '/dashboard/productions/shooting', status: 'active' as const },
  { id: 'post', label: 'Post-Production', path: '/dashboard/productions/post' },
];

const scopeOptions = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'archived', label: 'Archived' },
];

export const Default: Story = {
  render: () => (
    <WorkspaceShell
      sidebar={
        <WorkspaceSidebar
          workspaces={workspaces}
          activeWorkspace="productions"
          inboxCount={3}
        />
      }
      tabs={<WorkspaceTabs tabs={tabs} activeTab="overview" />}
      scopeBar={<ScopeBar options={scopeOptions} value="all" />}
    >
      <div className="p-6 text-muted-foreground">
        Canvas content area
      </div>
    </WorkspaceShell>
  ),
};

export const WithAIPanel: Story = {
  render: () => (
    <WorkspaceShell
      sidebar={
        <WorkspaceSidebar
          workspaces={workspaces}
          activeWorkspace="productions"
        />
      }
      tabs={<WorkspaceTabs tabs={tabs} activeTab="shooting" />}
      aiPanel={
        <AIPanel
          open
          messages={[
            { id: '1', role: 'user', content: 'What is in shooting?', timestamp: new Date().toISOString() },
            { id: '2', role: 'assistant', content: '3 productions are in shooting.', timestamp: new Date().toISOString() },
          ]}
        />
      }
    >
      <div className="p-6 text-muted-foreground">
        Canvas content with AI panel
      </div>
    </WorkspaceShell>
  ),
};

export const CollapsedSidebar: Story = {
  render: () => (
    <WorkspaceShell
      sidebar={
        <WorkspaceSidebar
          workspaces={workspaces}
          collapsed
        />
      }
      tabs={<WorkspaceTabs tabs={tabs} activeTab="overview" />}
      sidebarCollapsed
    >
      <div className="p-6 text-muted-foreground">
        Collapsed sidebar view
      </div>
    </WorkspaceShell>
  ),
};
