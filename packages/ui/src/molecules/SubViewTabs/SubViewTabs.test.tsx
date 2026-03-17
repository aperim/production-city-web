import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubViewTabs, type SubViewTab } from './SubViewTabs';

const tabs: SubViewTab[] = [
  { id: 'users', label: 'Users' },
  { id: 'invitations', label: 'Invitations' },
  { id: 'approvals', label: 'Approvals' },
];

describe('SubViewTabs', () => {
  it('renders all visible tabs', () => {
    render(<SubViewTabs tabs={tabs} activeTab="users" onTabChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Users' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Invitations' })).toBeDefined();
    expect(screen.getByRole('tab', { name: 'Approvals' })).toBeDefined();
  });

  it('marks the active tab as selected', () => {
    render(<SubViewTabs tabs={tabs} activeTab="invitations" onTabChange={vi.fn()} />);
    const active = screen.getByRole('tab', { name: 'Invitations' });
    expect(active.getAttribute('aria-selected')).toBe('true');
  });

  it('calls onTabChange when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<SubViewTabs tabs={tabs} activeTab="users" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Approvals' }));
    expect(onTabChange).toHaveBeenCalledWith('approvals');
  });

  it('hides tabs not in the tabs array', () => {
    const subset: SubViewTab[] = [
      { id: 'users', label: 'Users' },
      { id: 'approvals', label: 'Approvals' },
    ];
    render(<SubViewTabs tabs={subset} activeTab="users" onTabChange={vi.fn()} />);
    expect(screen.queryByRole('tab', { name: 'Invitations' })).toBeNull();
  });

  it('renders with a tablist role', () => {
    render(<SubViewTabs tabs={tabs} activeTab="users" onTabChange={vi.fn()} />);
    expect(screen.getByRole('tablist')).toBeDefined();
  });

  it('supports keyboard navigation with arrow keys', () => {
    const onTabChange = vi.fn();
    render(<SubViewTabs tabs={tabs} activeTab="users" onTabChange={onTabChange} />);
    const firstTab = screen.getByRole('tab', { name: 'Users' });
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
    expect(onTabChange).toHaveBeenCalledWith('invitations');
  });

  it('does not render when only one tab', () => {
    const single: SubViewTab[] = [{ id: 'users', label: 'Users' }];
    const { container } = render(
      <SubViewTabs tabs={single} activeTab="users" onTabChange={vi.fn()} />,
    );
    expect(container.querySelector('[role="tablist"]')).toBeNull();
  });

  it('renders nothing when no tabs', () => {
    const { container } = render(
      <SubViewTabs tabs={[]} activeTab="users" onTabChange={vi.fn()} />,
    );
    expect(container.querySelector('[role="tablist"]')).toBeNull();
  });

  it('supports optional badge on tabs', () => {
    const withBadge: SubViewTab[] = [
      { id: 'users', label: 'Users', badge: '5' },
      { id: 'invitations', label: 'Invitations' },
    ];
    render(<SubViewTabs tabs={withBadge} activeTab="users" onTabChange={vi.fn()} />);
    expect(screen.getByText('5')).toBeDefined();
  });
});
