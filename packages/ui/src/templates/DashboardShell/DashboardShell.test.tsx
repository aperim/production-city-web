import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DashboardShell } from './DashboardShell';

describe('DashboardShell', () => {
  it('renders sidebar slot', () => {
    render(
      <DashboardShell sidebar={<nav data-testid="sidebar">Sidebar</nav>}>
        Content
      </DashboardShell>,
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders main content', () => {
    render(
      <DashboardShell sidebar={<nav>Sidebar</nav>}>
        <p>Dashboard content</p>
      </DashboardShell>,
    );
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('renders breadcrumb slot', () => {
    render(
      <DashboardShell
        sidebar={<nav>Sidebar</nav>}
        breadcrumb={<nav data-testid="breadcrumb">Dashboard &gt; HR</nav>}
      >
        Content
      </DashboardShell>,
    );
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });

  it('renders header slot', () => {
    render(
      <DashboardShell
        sidebar={<nav>Sidebar</nav>}
        header={<div data-testid="header-actions">Actions</div>}
      >
        Content
      </DashboardShell>,
    );
    expect(screen.getByTestId('header-actions')).toBeInTheDocument();
  });

  it('has skip navigation link', () => {
    render(
      <DashboardShell sidebar={<nav>Sidebar</nav>}>Content</DashboardShell>,
    );
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('has main landmark with id for skip link target', () => {
    render(
      <DashboardShell sidebar={<nav>Sidebar</nav>}>Content</DashboardShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('main content area is focusable for skip nav', () => {
    render(
      <DashboardShell sidebar={<nav>Sidebar</nav>}>Content</DashboardShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('renders header element', () => {
    render(
      <DashboardShell sidebar={<nav>Sidebar</nav>}>Content</DashboardShell>,
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DashboardShell sidebar={<nav>Sidebar</nav>} className="custom">Content</DashboardShell>,
    );
    expect(container.firstElementChild?.className).toContain('custom');
  });
});
