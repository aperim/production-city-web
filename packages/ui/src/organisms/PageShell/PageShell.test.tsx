import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageShell } from './PageShell';

describe('PageShell', () => {
  it('renders children in main', () => {
    render(<PageShell>Main content</PageShell>);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('renders header slot', () => {
    render(<PageShell header={<nav>Header</nav>}>Content</PageShell>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('renders sidebar slot', () => {
    render(<PageShell sidebar={<div>Sidebar</div>}>Content</PageShell>);
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('hides sidebar when layout=no-sidebar', () => {
    render(<PageShell sidebar={<div>Sidebar</div>} layout="no-sidebar">Content</PageShell>);
    expect(screen.queryByText('Sidebar')).toBeNull();
  });

  it('renders footer slot', () => {
    render(<PageShell footer={<div>Footer</div>}>Content</PageShell>);
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders main with correct id', () => {
    render(<PageShell mainId="custom-main">Content</PageShell>);
    expect(document.getElementById('custom-main')).toBeInTheDocument();
  });

  it('shows skeleton loading state', () => {
    render(<PageShell loading={true}>Content</PageShell>);
    // Loading skeleton hides children via aria-hidden
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('applies content padding by default', () => {
    render(<PageShell>Content</PageShell>);
    const main = screen.getByRole('main');
    expect(main.className).toContain('p-6');
  });

  it('removes content padding when contentPadding=false', () => {
    render(<PageShell contentPadding={false}>Content</PageShell>);
    const main = screen.getByRole('main');
    expect(main.className).not.toContain('p-6');
  });
});
