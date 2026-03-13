import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavigationHeader } from './NavigationHeader';

const items = [
  { label: 'Home', href: '/', active: true },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: 'mailto:hello@example.com' },
];

describe('NavigationHeader', () => {
  it('renders logo slot', () => {
    render(<NavigationHeader logo={<span>Logo</span>} />);
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('renders nav items on desktop nav', () => {
    render(<NavigationHeader navItems={items} />);
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
  });

  it('marks active item with aria-current="page"', () => {
    render(<NavigationHeader navItems={items} />);
    const activeLinks = screen.getAllByRole('link', { name: 'Home' });
    expect(activeLinks.some((l) => l.getAttribute('aria-current') === 'page')).toBe(true);
  });

  it('rejects javascript: hrefs and replaces with #', () => {
    const dangerousItems = [{ label: 'Click', href: 'javascript:alert(1)' }];
    render(<NavigationHeader navItems={dangerousItems} />);
    const links = screen.getAllByRole('link', { name: 'Click' });
    links.forEach((l) => expect(l.getAttribute('href')).toBe('#'));
  });

  it('rejects data: hrefs and replaces with #', () => {
    const dangerousItems = [{ label: 'Data', href: 'data:text/html,<h1>xss</h1>' }];
    render(<NavigationHeader navItems={dangerousItems} />);
    const links = screen.getAllByRole('link', { name: 'Data' });
    links.forEach((l) => expect(l.getAttribute('href')).toBe('#'));
  });

  it('allows https: hrefs', () => {
    const safeItems = [{ label: 'External', href: 'https://example.com', external: true }];
    render(<NavigationHeader navItems={safeItems} />);
    const links = screen.getAllByRole('link', { name: 'External' });
    expect(links.some((l) => l.getAttribute('href') === 'https://example.com')).toBe(true);
  });

  it('renders skip-to-content link', () => {
    render(<NavigationHeader />);
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
  });

  it('renders hamburger button on mobile', () => {
    render(<NavigationHeader navItems={items} />);
    expect(screen.getByRole('button', { name: /open navigation/i })).toBeInTheDocument();
  });

  it('toggles mobile nav on hamburger click', async () => {
    render(<NavigationHeader navItems={items} />);
    const btn = screen.getByRole('button', { name: /open navigation/i });
    await userEvent.click(btn);
    expect(screen.getByRole('button', { name: /close navigation/i })).toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(<NavigationHeader actions={<button>Sign In</button>} />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('applies sticky class when sticky=true', () => {
    render(<NavigationHeader sticky={true} />);
    const header = screen.getByRole('banner');
    expect(header.className).toContain('sticky');
  });
});
