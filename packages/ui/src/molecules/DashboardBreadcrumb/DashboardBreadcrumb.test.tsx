import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { DashboardBreadcrumb, resolveBreadcrumbs, type BreadcrumbSidebarGroup } from './DashboardBreadcrumb';

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
          {
            id: 'company_ops.hr',
            label: 'Human Resources',
            featureIds: ['company_ops.hr.directory', 'company_ops.hr.org_chart'],
          },
          {
            id: 'company_ops.legal',
            label: 'Legal',
            featureIds: ['company_ops.legal.contracts'],
          },
        ],
      },
    ],
  },
];

describe('resolveBreadcrumbs', () => {
  it('returns Dashboard for root path', () => {
    const result = resolveBreadcrumbs('/dashboard', sidebarConfig);
    expect(result).toEqual([{ label: 'Dashboard', path: '/dashboard' }]);
  });

  it('resolves section-level path', () => {
    const result = resolveBreadcrumbs('/dashboard/company', sidebarConfig);
    expect(result).toEqual([
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Company Operations', path: '/dashboard/company' },
    ]);
  });

  it('resolves subsection-level path', () => {
    const result = resolveBreadcrumbs('/dashboard/company/hr', sidebarConfig);
    expect(result).toEqual([
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Company Operations', path: '/dashboard/company' },
      { label: 'Human Resources' },
    ]);
  });

  it('resolves feature-level path', () => {
    const result = resolveBreadcrumbs('/dashboard/company/hr/directory', sidebarConfig);
    expect(result).toEqual([
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Company Operations', path: '/dashboard/company' },
      { label: 'Human Resources' },
      { label: 'Directory' },
    ]);
  });

  it('returns Dashboard only for unknown path', () => {
    const result = resolveBreadcrumbs('/dashboard/unknown/path', sidebarConfig);
    expect(result).toEqual([{ label: 'Dashboard', path: '/dashboard' }]);
  });
});

describe('DashboardBreadcrumb', () => {
  it('renders nav with aria-label', () => {
    render(<DashboardBreadcrumb currentPath="/dashboard" sidebarConfig={sidebarConfig} />);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders Dashboard as current for root', () => {
    render(<DashboardBreadcrumb currentPath="/dashboard" sidebarConfig={sidebarConfig} />);
    // Desktop breadcrumb
    const current = screen.getAllByText('Dashboard').find(
      (el) => el.getAttribute('aria-current') === 'page',
    );
    expect(current).toBeInTheDocument();
  });

  it('renders clickable non-final segments', () => {
    render(<DashboardBreadcrumb currentPath="/dashboard/company/hr/directory" sidebarConfig={sidebarConfig} />);
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.textContent === 'Dashboard')).toBe(true);
  });

  it('renders final segment as non-link', () => {
    render(<DashboardBreadcrumb currentPath="/dashboard/company/hr/directory" sidebarConfig={sidebarConfig} />);
    const current = screen.getAllByText('Directory').find(
      (el) => el.getAttribute('aria-current') === 'page',
    );
    expect(current).toBeInTheDocument();
    expect(current?.tagName).toBe('SPAN');
  });

  it('renders expandable ellipsis on mobile for deep paths', async () => {
    const user = userEvent.setup();
    render(<DashboardBreadcrumb currentPath="/dashboard/company/hr/directory" sidebarConfig={sidebarConfig} />);

    const expandButton = screen.getByRole('button', { name: 'Show full breadcrumb' });
    expect(expandButton).toBeInTheDocument();

    await user.click(expandButton);

    // After expanding, ellipsis should be gone
    expect(screen.queryByRole('button', { name: 'Show full breadcrumb' })).not.toBeInTheDocument();
  });
});
