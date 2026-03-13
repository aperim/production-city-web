import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar, type SidebarSection } from './Sidebar';

const sections: SidebarSection[] = [
  {
    id: 'main',
    heading: 'Main',
    items: [
      { id: 'home', label: 'Home', href: '/', active: true },
      { id: 'projects', label: 'Projects', href: '/projects', badge: '5' },
      {
        id: 'team',
        label: 'Team',
        href: '/team',
        children: [
          { id: 'members', label: 'Members', href: '/team/members' },
        ],
      },
    ],
  },
];

describe('Sidebar', () => {
  it('renders nav items', () => {
    render(<Sidebar sections={sections} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('marks active item with aria-current="page"', () => {
    render(<Sidebar sections={sections} />);
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });

  it('rejects javascript: hrefs', () => {
    const badSections: SidebarSection[] = [
      {
        id: 's',
        items: [{ id: 'bad', label: 'Bad', href: 'javascript:alert(1)' }],
      },
    ];
    render(<Sidebar sections={badSections} />);
    expect(screen.getByRole('link', { name: 'Bad' }).getAttribute('href')).toBe('#');
  });

  it('renders badge content', () => {
    render(<Sidebar sections={sections} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders section heading', () => {
    render(<Sidebar sections={sections} />);
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('renders as hidden when state="hidden"', () => {
    const { container } = render(<Sidebar sections={sections} state="hidden" />);
    expect(container.firstChild).toBeNull();
  });

  it('hides labels when collapsed', () => {
    render(<Sidebar sections={sections} state="collapsed" />);
    // Labels are hidden in icon-only mode
    expect(screen.queryByText('Projects')).toBeNull();
  });

  it('hides section heading when collapsed', () => {
    render(<Sidebar sections={sections} state="collapsed" />);
    expect(screen.queryByText('Main')).toBeNull();
  });

  it('renders collapse toggle button', () => {
    render(<Sidebar sections={sections} state="expanded" showToggle />);
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument();
  });

  it('calls onStateChange when toggle clicked', async () => {
    const onStateChange = vi.fn();
    render(<Sidebar sections={sections} state="expanded" onStateChange={onStateChange} showToggle />);
    await userEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }));
    expect(onStateChange).toHaveBeenCalledWith('collapsed');
  });

  it('expands nested items on click', async () => {
    render(<Sidebar sections={sections} state="expanded" />);
    const teamBtn = screen.getByRole('button', { name: 'Team' });
    expect(screen.queryByText('Members')).toBeNull();
    await userEvent.click(teamBtn);
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  it('renders footer slot', () => {
    render(<Sidebar sections={[]} footer={<div>Footer content</div>} />);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});
