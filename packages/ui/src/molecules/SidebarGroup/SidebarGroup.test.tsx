import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SidebarGroup } from './SidebarGroup';
import type { SidebarItemProps } from '../../atoms/SidebarItem/SidebarItem';

const items: SidebarItemProps[] = [
  { id: 'item-1', label: 'Team Directory', path: '/dashboard/company/hr/directory' },
  { id: 'item-2', label: 'Org Chart', path: '/dashboard/company/hr/org-chart', status: 'coming_soon' },
];

describe('SidebarGroup', () => {
  it('renders group heading', () => {
    render(<SidebarGroup label="Human Resources" items={items} isExpanded onToggle={() => {}} />);
    expect(screen.getByText('Human Resources')).toBeInTheDocument();
  });

  it('renders items when expanded', () => {
    render(<SidebarGroup label="HR" items={items} isExpanded onToggle={() => {}} />);
    expect(screen.getByText('Team Directory')).toBeInTheDocument();
    expect(screen.getByText('Org Chart')).toBeInTheDocument();
  });

  it('hides items when collapsed', () => {
    render(<SidebarGroup label="HR" items={items} isExpanded={false} onToggle={() => {}} />);
    expect(screen.queryByText('Team Directory')).not.toBeInTheDocument();
  });

  it('calls onToggle when heading button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SidebarGroup label="HR" items={items} isExpanded onToggle={onToggle} />);
    await user.click(screen.getByRole('button', { expanded: true }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('has aria-expanded on toggle button', () => {
    render(<SidebarGroup label="HR" items={items} isExpanded onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('has aria-expanded false when collapsed', () => {
    render(<SidebarGroup label="HR" items={items} isExpanded={false} onToggle={() => {}} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('has aria-controls matching content id', () => {
    render(<SidebarGroup label="HR" items={items} isExpanded onToggle={() => {}} />);
    const button = screen.getByRole('button');
    const controlsId = button.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(screen.getByRole('list')).toHaveAttribute('id', controlsId);
  });

  it('returns null for empty items', () => {
    const { container } = render(<SidebarGroup label="Empty" items={[]} isExpanded onToggle={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders items directly in collapsed sidebar mode (no heading)', () => {
    render(<SidebarGroup label="HR" items={items} isExpanded collapsed onToggle={() => {}} />);
    // In collapsed mode, no button/heading is rendered
    expect(screen.queryByText('HR')).not.toBeInTheDocument();
    // Items are rendered (as links with aria-label)
    expect(screen.getByRole('link', { name: 'Team Directory' })).toBeInTheDocument();
  });

  it('activates toggle with keyboard Enter', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SidebarGroup label="HR" items={items} isExpanded={false} onToggle={onToggle} />);
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('activates toggle with keyboard Space', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<SidebarGroup label="HR" items={items} isExpanded={false} onToggle={onToggle} />);
    screen.getByRole('button').focus();
    await user.keyboard(' ');
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
