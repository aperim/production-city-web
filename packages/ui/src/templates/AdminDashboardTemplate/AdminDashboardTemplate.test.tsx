import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AdminDashboardTemplate } from './AdminDashboardTemplate';

describe('AdminDashboardTemplate', () => {
  it('renders children content', () => {
    render(
      <AdminDashboardTemplate>
        <p>Dashboard content</p>
      </AdminDashboardTemplate>,
    );
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('renders breadcrumbs when provided', () => {
    render(
      <AdminDashboardTemplate breadcrumbs={[{ label: 'Admin' }, { label: 'Users' }]}>
        <p>Content</p>
      </AdminDashboardTemplate>,
    );
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders sidebar sections', () => {
    render(
      <AdminDashboardTemplate
        sidebarSections={[{
          id: 'main',
          heading: 'Navigation',
          items: [{ id: 'users', label: 'Users' }],
        }]}
      >
        <p>Content</p>
      </AdminDashboardTemplate>,
    );
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('renders logo in header', () => {
    render(
      <AdminDashboardTemplate logo={<span>Logo</span>}>
        <p>Content</p>
      </AdminDashboardTemplate>,
    );
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });
});
