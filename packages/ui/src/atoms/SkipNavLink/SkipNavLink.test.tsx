import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkipNavLink } from './SkipNavLink';

describe('SkipNavLink', () => {
  it('renders with default props', () => {
    render(<SkipNavLink />);
    const link = screen.getByText('Skip to main content');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('#main-content');
  });

  it('uses custom targetId and label', () => {
    render(<SkipNavLink targetId="content" label="Jump to content" />);
    const link = screen.getByText('Jump to content');
    expect(link.getAttribute('href')).toBe('#content');
  });

  it('has sr-only class for visual hiding', () => {
    render(<SkipNavLink />);
    const link = screen.getByText('Skip to main content');
    expect(link.className).toContain('sr-only');
  });

  it('has focus:not-sr-only for visibility on focus', () => {
    render(<SkipNavLink />);
    const link = screen.getByText('Skip to main content');
    expect(link.className).toContain('focus:not-sr-only');
  });

  it('applies custom className', () => {
    render(<SkipNavLink className="extra" />);
    const link = screen.getByText('Skip to main content');
    expect(link.className).toContain('extra');
  });
});
