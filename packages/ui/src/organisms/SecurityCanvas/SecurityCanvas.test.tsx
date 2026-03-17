import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SecurityCanvas } from './SecurityCanvas';
import type { AuditLogEntryData } from './SecurityCanvas';

const mockEntries: AuditLogEntryData[] = [
  { id: '1', action: 'Logged in', actorName: 'Alice', timestamp: new Date('2026-03-15T10:00:00Z'), ipAddress: '192.168.1.1' },
  { id: '2', action: 'Changed role', actorName: 'Bob', subjectName: 'Carol', timestamp: new Date('2026-03-14T09:00:00Z') },
  { id: '3', action: 'Deleted user', actorName: 'Alice', subjectName: 'Dave', details: 'Removed for inactivity', timestamp: new Date('2026-03-13T08:00:00Z') },
];

describe('SecurityCanvas', () => {
  const defaultProps = {
    entries: mockEntries,
    hasPermission: true,
    onLoadMore: vi.fn(),
    hasMore: true,
  };

  it('renders audit log entries', () => {
    render(<SecurityCanvas {...defaultProps} />);
    expect(screen.getByText('Logged in')).toBeDefined();
    expect(screen.getByText('Changed role')).toBeDefined();
    expect(screen.getByText('Deleted user')).toBeDefined();
  });

  it('renders actor names', () => {
    render(<SecurityCanvas {...defaultProps} />);
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('renders load more button when hasMore is true', () => {
    render(<SecurityCanvas {...defaultProps} />);
    expect(screen.getByRole('button', { name: /load more/i })).toBeDefined();
  });

  it('calls onLoadMore when load more is clicked', () => {
    const onLoadMore = vi.fn();
    render(<SecurityCanvas {...defaultProps} onLoadMore={onLoadMore} />);
    fireEvent.click(screen.getByRole('button', { name: /load more/i }));
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('hides load more when hasMore is false', () => {
    render(<SecurityCanvas {...defaultProps} hasMore={false} />);
    expect(screen.queryByRole('button', { name: /load more/i })).toBeNull();
  });

  it('renders access-denied when no permission', () => {
    render(<SecurityCanvas {...defaultProps} hasPermission={false} />);
    expect(screen.getByText(/no access/i)).toBeDefined();
  });

  it('renders loading state', () => {
    render(<SecurityCanvas {...defaultProps} loading />);
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it('renders error state', () => {
    render(<SecurityCanvas {...defaultProps} error="Failed to load audit log" />);
    expect(screen.getByText('Failed to load audit log')).toBeDefined();
  });

  it('renders empty state when no entries', () => {
    render(<SecurityCanvas {...defaultProps} entries={[]} />);
    expect(screen.getByText(/no audit/i)).toBeDefined();
  });

  it('renders action type filter', () => {
    render(<SecurityCanvas {...defaultProps} />);
    expect(screen.getByLabelText(/action type/i)).toBeDefined();
  });

  it('calls onFilterChange when action type filter changes', () => {
    const onFilterChange = vi.fn();
    render(<SecurityCanvas {...defaultProps} onFilterChange={onFilterChange} />);
    const select = screen.getByLabelText(/action type/i);
    fireEvent.change(select, { target: { value: 'login' } });
    expect(onFilterChange).toHaveBeenCalledWith(expect.objectContaining({ actionType: 'login' }));
  });

  it('renders date range filter', () => {
    render(<SecurityCanvas {...defaultProps} />);
    expect(screen.getByLabelText(/from/i)).toBeDefined();
    expect(screen.getByLabelText(/to/i)).toBeDefined();
  });

  it('renders user filter', () => {
    render(<SecurityCanvas {...defaultProps} />);
    expect(screen.getByLabelText(/user/i)).toBeDefined();
  });
});
