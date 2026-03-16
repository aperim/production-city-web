import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ComingSoonPage } from './ComingSoonPage';

const baseFeature = {
  id: 'company_ops.hr.directory',
  label: 'Team Directory',
  description: 'Employee directory with profiles, contact details',
  status: 'coming_soon' as const,
  targetQuarter: 'Q3 2026',
  priority: 'p2',
  phase: 'company_formation',
};

const relatedFeatures = [
  { id: 'company_ops.hr.org_chart', label: 'Organisation Chart', status: 'planned' as const, targetQuarter: 'Q4 2026', path: '/dashboard/company/hr/org-chart' },
  { id: 'company_ops.hr.recruitment', label: 'Recruitment Pipeline', status: 'coming_soon' as const, targetQuarter: 'Q3 2026', path: '/dashboard/company/hr/recruitment' },
];

describe('ComingSoonPage', () => {
  it('renders feature label', () => {
    render(<ComingSoonPage feature={baseFeature} />);
    expect(screen.getByRole('heading', { name: 'Team Directory' })).toBeInTheDocument();
  });

  it('renders feature description', () => {
    render(<ComingSoonPage feature={baseFeature} />);
    expect(screen.getByText(baseFeature.description)).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<ComingSoonPage feature={baseFeature} />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('renders target quarter', () => {
    render(<ComingSoonPage feature={baseFeature} />);
    expect(screen.getByText('Q3 2026')).toBeInTheDocument();
  });

  it('renders priority label', () => {
    render(<ComingSoonPage feature={baseFeature} />);
    expect(screen.getByText('Second Wave')).toBeInTheDocument();
  });

  it('renders phase label', () => {
    render(<ComingSoonPage feature={baseFeature} />);
    expect(screen.getByText('Company Formation')).toBeInTheDocument();
  });

  it('does not render target when null', () => {
    render(<ComingSoonPage feature={{ ...baseFeature, targetQuarter: null, status: 'planned' }} />);
    expect(screen.queryByText('Target')).not.toBeInTheDocument();
  });

  it('renders Notify Me button when callback provided', () => {
    render(<ComingSoonPage feature={baseFeature} onNotifyMe={async () => {}} />);
    expect(screen.getByRole('button', { name: 'Notify me when this launches' })).toBeInTheDocument();
  });

  it('does not render Notify Me button when no callback', () => {
    render(<ComingSoonPage feature={baseFeature} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('transitions to subscribed state on success', async () => {
    const user = userEvent.setup();
    const onNotifyMe = vi.fn().mockResolvedValue(undefined);
    render(<ComingSoonPage feature={baseFeature} onNotifyMe={onNotifyMe} />);

    await user.click(screen.getByRole('button', { name: 'Notify me when this launches' }));

    await waitFor(() => {
      expect(screen.getByText('Subscribed')).toBeInTheDocument();
    });
    expect(onNotifyMe).toHaveBeenCalledOnce();
  });

  it('transitions to error state on failure', async () => {
    const user = userEvent.setup();
    const onNotifyMe = vi.fn().mockRejectedValue(new Error('fail'));
    render(<ComingSoonPage feature={baseFeature} onNotifyMe={onNotifyMe} />);

    await user.click(screen.getByRole('button', { name: 'Notify me when this launches' }));

    await waitFor(() => {
      expect(screen.getByText('Failed — tap to retry')).toBeInTheDocument();
    });
  });

  it('renders initially as subscribed', () => {
    render(<ComingSoonPage feature={baseFeature} onNotifyMe={async () => {}} notifyMeState="subscribed" />);
    expect(screen.getByText('Subscribed')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders related features', () => {
    render(<ComingSoonPage feature={baseFeature} relatedFeatures={relatedFeatures} />);
    expect(screen.getByText('Organisation Chart')).toBeInTheDocument();
    expect(screen.getByText('Recruitment Pipeline')).toBeInTheDocument();
  });

  it('renders related features as links', () => {
    render(<ComingSoonPage feature={baseFeature} relatedFeatures={relatedFeatures} />);
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/dashboard/company/hr/org-chart')).toBe(true);
  });

  it('does not render related features section when empty', () => {
    render(<ComingSoonPage feature={baseFeature} relatedFeatures={[]} />);
    expect(screen.queryByText('Related Features')).not.toBeInTheDocument();
  });

  it('renders for planned status', () => {
    render(<ComingSoonPage feature={{ ...baseFeature, status: 'planned', targetQuarter: null }} />);
    expect(screen.getByText('Planned')).toBeInTheDocument();
  });
});
