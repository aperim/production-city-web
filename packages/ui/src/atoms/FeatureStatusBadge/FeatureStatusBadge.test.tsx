import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import type { FeatureStatus } from './FeatureStatusBadge';

describe('FeatureStatusBadge', () => {
  const statuses: Array<{ status: FeatureStatus; label: string }> = [
    { status: 'active', label: 'Active' },
    { status: 'coming_soon', label: 'Coming Soon' },
    { status: 'planned', label: 'Planned' },
    { status: 'deprecated', label: 'Deprecated' },
  ];

  for (const { status, label } of statuses) {
    it(`renders "${label}" for status "${status}"`, () => {
      render(<FeatureStatusBadge status={status} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    it(`has aria-label "${label}" for status "${status}"`, () => {
      render(<FeatureStatusBadge status={status} />);
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  }

  it('applies custom className', () => {
    const { container } = render(<FeatureStatusBadge status="active" className="custom" />);
    expect(container.querySelector('span')?.className).toContain('custom');
  });

  it('renders as a span element', () => {
    const { container } = render(<FeatureStatusBadge status="active" />);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});
