import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SidebarItem } from './SidebarItem';

describe('SidebarItem', () => {
  it('renders label and link', () => {
    render(<SidebarItem id="test" label="Team Directory" path="/dashboard/company/hr/directory" />);
    const link = screen.getByRole('link', { name: 'Team Directory' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard/company/hr/directory');
  });

  it('sets aria-current="page" when active', () => {
    render(<SidebarItem id="test" label="Users" path="/dashboard/users" isActive />);
    expect(screen.getByRole('link')).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current when inactive', () => {
    render(<SidebarItem id="test" label="Users" path="/dashboard/users" />);
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-current');
  });

  it('shows status indicator for coming_soon', () => {
    render(<SidebarItem id="test" label="Feature" path="/test" status="coming_soon" />);
    expect(screen.getByRole('img', { name: 'Coming soon' })).toBeInTheDocument();
  });

  it('shows status indicator for planned', () => {
    render(<SidebarItem id="test" label="Feature" path="/test" status="planned" />);
    expect(screen.getByRole('img', { name: 'Planned' })).toBeInTheDocument();
  });

  it('does not show status indicator for active features', () => {
    render(<SidebarItem id="test" label="Feature" path="/test" status="active" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders badge when provided', () => {
    render(<SidebarItem id="test" label="Feature" path="/test" badge="3" />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides label and shows aria-label in collapsed mode', () => {
    render(<SidebarItem id="test" label="Users" path="/test" collapsed />);
    const link = screen.getByRole('link', { name: 'Users' });
    expect(link).toHaveAttribute('aria-label', 'Users');
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('hides badge in collapsed mode', () => {
    render(<SidebarItem id="test" label="Feature" path="/test" badge="5" collapsed />);
    expect(screen.queryByText('5')).not.toBeInTheDocument();
  });

  it('hides status indicator in collapsed mode', () => {
    render(<SidebarItem id="test" label="Feature" path="/test" status="coming_soon" collapsed />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders icon', () => {
    render(
      <SidebarItem id="test" label="Feature" path="/test" icon={<svg data-testid="icon" />} />,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('applies active styling class', () => {
    const { container } = render(
      <SidebarItem id="test" label="Feature" path="/test" isActive />,
    );
    const link = container.querySelector('a');
    expect(link?.className).toContain('bg-accent');
    expect(link?.className).toContain('font-medium');
  });
});
