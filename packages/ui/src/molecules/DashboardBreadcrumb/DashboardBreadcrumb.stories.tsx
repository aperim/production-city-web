import type { Meta, StoryObj } from '@storybook/react-vite';
import { DashboardBreadcrumb, type BreadcrumbSidebarGroup } from './DashboardBreadcrumb';

const sidebarConfig: BreadcrumbSidebarGroup[] = [
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
          { id: 'company_ops.hr', label: 'Human Resources', featureIds: ['company_ops.hr.directory', 'company_ops.hr.org_chart'] },
          { id: 'company_ops.legal', label: 'Legal', featureIds: ['company_ops.legal.contracts'] },
        ],
      },
    ],
  },
];

const meta: Meta<typeof DashboardBreadcrumb> = {
  title: 'Molecules/DashboardBreadcrumb',
  component: DashboardBreadcrumb,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof DashboardBreadcrumb>;

export const ShallowPath: Story = {
  args: {
    currentPath: '/dashboard',
    sidebarConfig,
  },
};

export const MediumPath: Story = {
  args: {
    currentPath: '/dashboard/company/hr',
    sidebarConfig,
  },
};

export const DeepPath: Story = {
  args: {
    currentPath: '/dashboard/company/hr/directory',
    sidebarConfig,
  },
};

export const UnknownPath: Story = {
  args: {
    currentPath: '/dashboard/unknown/feature',
    sidebarConfig,
  },
};

export const MobileTruncated: Story = {
  args: {
    currentPath: '/dashboard/company/hr/directory',
    sidebarConfig,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
