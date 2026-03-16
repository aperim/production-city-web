import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SidebarNav, type NavGroup, type NavRoute } from './SidebarNav';

const config: NavGroup[] = [
  {
    id: 'workspace',
    label: 'Your Workspace',
    sections: [
      {
        id: 'home',
        label: 'Dashboard',
        icon: 'home',
        path: '/dashboard',
        subsections: [
          { id: 'home.overview', label: 'Overview', featureIds: ['home.overview.executive'] },
        ],
      },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    sections: [
      {
        id: 'company_ops',
        label: 'Company Operations',
        icon: 'building',
        path: '/dashboard/company',
        subsections: [
          { id: 'company_ops.hr', label: 'Human Resources', featureIds: ['company_ops.hr.directory'] },
        ],
      },
    ],
  },
  {
    id: 'production',
    label: 'Production',
    sections: [
      {
        id: 'productions',
        label: 'Productions',
        icon: 'building',
        path: '/dashboard/productions',
        subsections: [
          { id: 'productions.active', label: 'Active Productions', featureIds: ['productions.active.board'] },
        ],
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    sections: [
      {
        id: 'admin',
        label: 'Administration',
        icon: 'building',
        path: '/dashboard/admin',
        subsections: [
          { id: 'admin.users', label: 'Users', featureIds: ['admin.users.management'] },
        ],
      },
    ],
  },
];

const routes: NavRoute[] = [
  { id: 'home.overview.executive', label: 'Executive Dashboard', path: '/dashboard/home/executive', status: 'planned' },
  { id: 'company_ops.hr.directory', label: 'Team Directory', path: '/dashboard/company/hr/directory', status: 'planned' },
  { id: 'productions.active.board', label: 'Production Board', path: '/dashboard/productions/active/board', status: 'planned' },
  { id: 'admin.users.management', label: 'User Management', path: '/dashboard/admin/users/management', status: 'planned' },
];

const allVisible = routes.map((r) => r.id);

// Mock localStorage
const store: Record<string, string> = {};
const mockStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const key of Object.keys(store)) delete store[key]; },
  get length() { return Object.keys(store).length; },
  key: (index: number) => Object.keys(store)[index] ?? null,
};

beforeEach(() => {
  for (const key of Object.keys(store)) delete store[key];
  Object.defineProperty(window, 'localStorage', { value: mockStorage, writable: true, configurable: true });
});

describe('SidebarNav', () => {
  it('renders navigation landmark', () => {
    render(
      <SidebarNav
        config={config}
        visibleFeatureIds={allVisible}
        currentPhase="operations"
        currentPath="/dashboard"
        routes={routes}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Dashboard navigation' })).toBeInTheDocument();
  });

  it('renders visible groups', () => {
    render(
      <SidebarNav
        config={config}
        visibleFeatureIds={allVisible}
        currentPhase="operations"
        currentPath="/dashboard"
        routes={routes}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />,
    );
    expect(screen.getByText('Your Workspace')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('hides groups not visible for current phase', () => {
    render(
      <SidebarNav
        config={config}
        visibleFeatureIds={allVisible}
        currentPhase="company_formation"
        currentPath="/dashboard"
        routes={routes}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />,
    );
    // Production group requires pre_operations phase
    expect(screen.queryByText('Production')).not.toBeInTheDocument();
    expect(screen.getByText('Your Workspace')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  it('hides groups with no visible features', () => {
    render(
      <SidebarNav
        config={config}
        visibleFeatureIds={['home.overview.executive']}
        currentPhase="operations"
        currentPath="/dashboard"
        routes={routes}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />,
    );
    expect(screen.getByText('Your Workspace')).toBeInTheDocument();
    expect(screen.queryByText('Company')).not.toBeInTheDocument();
  });

  it('calls onToggleCollapse when collapse button clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <SidebarNav
        config={config}
        visibleFeatureIds={allVisible}
        currentPhase="operations"
        currentPath="/dashboard"
        routes={routes}
        isCollapsed={false}
        onToggleCollapse={onToggle}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('shows expand label when collapsed', () => {
    render(
      <SidebarNav
        config={config}
        visibleFeatureIds={allVisible}
        currentPhase="operations"
        currentPath="/dashboard"
        routes={routes}
        isCollapsed
        onToggleCollapse={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  it('persists group expand state to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <SidebarNav
        config={config}
        visibleFeatureIds={allVisible}
        currentPhase="operations"
        currentPath="/dashboard"
        routes={routes}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />,
    );

    const workspaceToggle = screen.getByText('Your Workspace').closest('button')!;
    await user.click(workspaceToggle);

    const stored = JSON.parse(store['pc-sidebar-expand-state'] ?? '{}');
    expect(stored).toHaveProperty('workspace');
  });

  it('prunes unknown group IDs from stored state', () => {
    store['pc-sidebar-expand-state'] = JSON.stringify({
      workspace: true,
      unknown_group: true,
    });

    render(
      <SidebarNav
        config={config}
        visibleFeatureIds={allVisible}
        currentPhase="operations"
        currentPath="/dashboard"
        routes={routes}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />,
    );

    expect(screen.getByText('Your Workspace')).toBeInTheDocument();
  });

  it('auto-expands group containing active item', () => {
    render(
      <SidebarNav
        config={config}
        visibleFeatureIds={allVisible}
        currentPhase="operations"
        currentPath="/dashboard/company/hr/directory"
        routes={routes}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />,
    );

    expect(screen.getByText('Team Directory')).toBeInTheDocument();
  });
});
