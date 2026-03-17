import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RoleDashboard, type DashboardRole, type KpiCard, type QuickAction, type ActivityEntry } from './RoleDashboard';

const kpiCards: KpiCard[] = [
  { label: 'Total Users', value: '142', change: '+12%', trend: 'up' },
  { label: 'Active Sessions', value: '38', change: '-3%', trend: 'down' },
  { label: 'Open Issues', value: '7', trend: 'neutral' },
];

const quickActions: QuickAction[] = [
  { label: 'Invite User', href: '/dashboard/admin/users/invitations' },
  { label: 'View Approvals', href: '/dashboard/admin/users/approvals' },
];

const activities: ActivityEntry[] = [
  { id: '1', message: 'User admin@test.com signed in', timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: '2', message: 'New invitation sent to user@test.com', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
];

describe('RoleDashboard', () => {
  it('renders welcome message with user name', () => {
    render(<RoleDashboard userName="Alice" role="admin" />);
    expect(screen.getByText('Welcome back, Alice')).toBeInTheDocument();
  });

  it('renders role label and description', () => {
    render(<RoleDashboard userName="Alice" role="executive" />);
    expect(screen.getByText(/Executive/)).toBeInTheDocument();
    expect(screen.getByText(/Strategic metrics/)).toBeInTheDocument();
  });

  it('renders KPI cards', () => {
    render(<RoleDashboard userName="Alice" role="admin" kpiCards={kpiCards} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders KPI values as dash when loading', () => {
    render(<RoleDashboard userName="Alice" role="admin" kpiCards={kpiCards} loading />);
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBe(3);
  });

  it('renders loading skeleton when loading with no KPI data', () => {
    const { container } = render(<RoleDashboard userName="Alice" role="admin" loading />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBe(3);
  });

  it('renders quick actions as links', () => {
    render(<RoleDashboard userName="Alice" role="admin" quickActions={quickActions} />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    const inviteLink = screen.getByText('Invite User');
    expect(inviteLink.closest('a')).toHaveAttribute('href', '/dashboard/admin/users/invitations');
  });

  it('renders activity feed', () => {
    render(<RoleDashboard userName="Alice" role="admin" activities={activities} />);
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('User admin@test.com signed in')).toBeInTheDocument();
  });

  it('renders empty state when no data and not loading', () => {
    render(<RoleDashboard userName="Alice" role="guest" />);
    expect(screen.getByText(/dashboard is being set up/)).toBeInTheDocument();
  });

  it('renders all 10 role labels correctly', () => {
    const roles: DashboardRole[] = [
      'admin', 'executive', 'staff', 'client', 'investor',
      'guest', 'vendor', 'government', 'partner', 'first_nations',
    ];
    for (const role of roles) {
      const { unmount } = render(<RoleDashboard userName="Test" role={role} />);
      // Each role should render without error and show the welcome message
      expect(screen.getByText('Welcome back, Test')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders trend colors correctly', () => {
    render(
      <RoleDashboard
        userName="Alice"
        role="admin"
        kpiCards={kpiCards}
      />,
    );
    const upTrend = screen.getByText('+12%');
    expect(upTrend.className).toContain('emerald');
    const downTrend = screen.getByText('-3%');
    expect(downTrend.className).toContain('red');
  });

  it('does not show change indicators when loading', () => {
    render(
      <RoleDashboard userName="Alice" role="admin" kpiCards={kpiCards} loading />,
    );
    expect(screen.queryByText('+12%')).not.toBeInTheDocument();
  });

  it('quick action links have focus-visible styles', () => {
    render(<RoleDashboard userName="Alice" role="admin" quickActions={quickActions} />);
    const link = screen.getByText('Invite User').closest('a')!;
    expect(link.className).toContain('focus-visible:outline');
  });

  it('activity timestamps use time element with relative formatting', () => {
    render(<RoleDashboard userName="Alice" role="admin" activities={activities} />);
    const timeElements = screen.getAllByText('2m ago');
    expect(timeElements[0]!.tagName.toLowerCase()).toBe('time');
    // The second activity (15 min ago) should also render as relative time
    expect(screen.getByText('15m ago')).toBeInTheDocument();
  });

  it('handles invalid timestamps gracefully (no "Invalid Date")', () => {
    const badActivities: ActivityEntry[] = [
      { id: '1', message: 'Bad timestamp entry', timestamp: 'not-a-date' },
    ];
    render(<RoleDashboard userName="Alice" role="admin" activities={badActivities} />);
    // Should fall back to raw string rather than showing "Invalid Date"
    expect(screen.queryByText('Invalid Date')).not.toBeInTheDocument();
    expect(screen.getByText('not-a-date')).toBeInTheDocument();
  });

  it('formats ISO timestamps as relative time', () => {
    const isoActivities: ActivityEntry[] = [
      { id: '1', message: 'Just happened', timestamp: new Date(Date.now() - 30000).toISOString() },
      { id: '2', message: 'Hours ago', timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
      { id: '3', message: 'Days ago', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: '4', message: 'Weeks ago', timestamp: new Date(Date.now() - 10 * 86400000).toISOString() },
    ];
    render(<RoleDashboard userName="Alice" role="admin" activities={isoActivities} />);
    expect(screen.getByText('just now')).toBeInTheDocument();
    expect(screen.getByText('3h ago')).toBeInTheDocument();
    expect(screen.getByText('2d ago')).toBeInTheDocument();
    expect(screen.getByText('1w ago')).toBeInTheDocument();
  });
});
