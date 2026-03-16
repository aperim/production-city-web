import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SidebarNav, type NavGroup, type NavRoute, type Phase } from './SidebarNav';

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
          { id: 'home.overview', label: 'Overview', featureIds: ['home.overview.executive', 'home.overview.staff'] },
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
          { id: 'company_ops.hr', label: 'Human Resources', featureIds: ['company_ops.hr.directory', 'company_ops.hr.recruitment'] },
          { id: 'company_ops.legal', label: 'Legal', featureIds: ['company_ops.legal.contracts'] },
          { id: 'company_ops.finance', label: 'Finance', featureIds: ['company_ops.finance.accounts'] },
        ],
      },
      {
        id: 'gov_policy',
        label: 'Government & Policy',
        icon: 'landmark',
        path: '/dashboard/government',
        subsections: [
          { id: 'gov_policy.local', label: 'Local Government', featureIds: ['gov_policy.local.councils'] },
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
  { id: 'home.overview.staff', label: 'Staff Dashboard', path: '/dashboard/home/staff', status: 'planned' },
  { id: 'company_ops.hr.directory', label: 'Team Directory', path: '/dashboard/company/hr/directory', status: 'coming_soon' },
  { id: 'company_ops.hr.recruitment', label: 'Recruitment', path: '/dashboard/company/hr/recruitment', status: 'planned' },
  { id: 'company_ops.legal.contracts', label: 'Contracts', path: '/dashboard/company/legal/contracts', status: 'planned' },
  { id: 'company_ops.finance.accounts', label: 'Accounts', path: '/dashboard/company/finance/accounts', status: 'planned' },
  { id: 'gov_policy.local.councils', label: 'Local Councils', path: '/dashboard/government/local/councils', status: 'planned' },
  { id: 'productions.active.board', label: 'Production Board', path: '/dashboard/productions/active/board', status: 'planned' },
  { id: 'admin.users.management', label: 'User Management', path: '/dashboard/admin/users/management', status: 'planned' },
];

const allFeatureIds = routes.map((r) => r.id);

const meta: Meta<typeof SidebarNav> = {
  title: 'Organisms/SidebarNav',
  component: SidebarNav,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <Story />
        <div className="flex-1 bg-muted p-8">Content area</div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SidebarNav>;

function InteractiveSidebar({ phase = 'operations' as Phase, visibleFeatureIds = allFeatureIds }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarNav
      config={config}
      visibleFeatureIds={visibleFeatureIds}
      currentPhase={phase}
      currentPath="/dashboard/company/hr/directory"
      routes={routes}
      isCollapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
    />
  );
}

export const AdminOperations: Story = {
  render: () => <InteractiveSidebar />,
};

export const CompanyFormation: Story = {
  render: () => <InteractiveSidebar phase="company_formation" />,
};

export const StaffRole: Story = {
  render: () => (
    <InteractiveSidebar
      visibleFeatureIds={['home.overview.staff', 'company_ops.hr.directory']}
    />
  ),
};

export const GuestRole: Story = {
  render: () => <InteractiveSidebar visibleFeatureIds={['home.overview.executive']} />,
};

export const Collapsed: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(true);
    return (
      <SidebarNav
        config={config}
        visibleFeatureIds={allFeatureIds}
        currentPhase="operations"
        currentPath="/dashboard"
        routes={routes}
        isCollapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
    );
  },
};
