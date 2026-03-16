import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ComingSoonCard } from './ComingSoonCard';

describe('ComingSoonCard', () => {
  const baseProps = {
    id: 'test-feature',
    label: 'Team Directory',
    description: 'Employee directory with profiles, contact details, department, role, reporting line',
    status: 'coming_soon' as const,
    path: '/dashboard/company/hr/directory',
  };

  it('renders label', () => {
    render(<ComingSoonCard {...baseProps} />);
    expect(screen.getByText('Team Directory')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<ComingSoonCard {...baseProps} />);
    expect(screen.getByText(baseProps.description)).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<ComingSoonCard {...baseProps} />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('renders target quarter when provided', () => {
    render(<ComingSoonCard {...baseProps} targetQuarter="Q3 2026" />);
    expect(screen.getByText('Q3 2026')).toBeInTheDocument();
  });

  it('does not render target quarter when null', () => {
    render(<ComingSoonCard {...baseProps} targetQuarter={null} />);
    expect(screen.queryByText(/Q\d/)).not.toBeInTheDocument();
  });

  it('renders priority label', () => {
    render(<ComingSoonCard {...baseProps} priority="p2" />);
    expect(screen.getByText('Second Wave')).toBeInTheDocument();
  });

  it('links to the feature path', () => {
    render(<ComingSoonCard {...baseProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/dashboard/company/hr/directory');
  });

  it('renders planned status', () => {
    render(<ComingSoonCard {...baseProps} status="planned" />);
    expect(screen.getByText('Planned')).toBeInTheDocument();
  });

  it('renders all priority levels', () => {
    const { rerender } = render(<ComingSoonCard {...baseProps} priority="p1" />);
    expect(screen.getByText('First Wave')).toBeInTheDocument();

    rerender(<ComingSoonCard {...baseProps} priority="p2" />);
    expect(screen.getByText('Second Wave')).toBeInTheDocument();

    rerender(<ComingSoonCard {...baseProps} priority="p3" />);
    expect(screen.getByText('Future')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ComingSoonCard {...baseProps} className="custom" />);
    expect(container.querySelector('a')?.className).toContain('custom');
  });
});
