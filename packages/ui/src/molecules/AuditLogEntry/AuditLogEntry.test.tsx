import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuditLogEntry } from './AuditLogEntry';

describe('AuditLogEntry', () => {
  const baseProps = {
    action: 'logged in',
    timestamp: new Date('2026-03-12T14:30:00Z'),
  };

  it('renders action text', () => {
    render(<AuditLogEntry {...baseProps} />);
    expect(screen.getByText('logged in')).toBeInTheDocument();
  });

  it('renders actor name when provided', () => {
    render(<AuditLogEntry {...baseProps} actorName="Jane Smith" />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders subject name when provided', () => {
    render(<AuditLogEntry {...baseProps} subjectName="Bob" />);
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders details when provided', () => {
    render(<AuditLogEntry {...baseProps} details="Some detail" />);
    expect(screen.getByText('Some detail')).toBeInTheDocument();
  });

  it('renders ip address when provided', () => {
    render(<AuditLogEntry {...baseProps} ipAddress="192.168.1.1" />);
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('renders timestamp as time element', () => {
    render(<AuditLogEntry {...baseProps} />);
    const timeEl = screen.getByText(/Mar/);
    expect(timeEl.tagName).toBe('TIME');
    expect(timeEl).toHaveAttribute('datetime', '2026-03-12T14:30:00.000Z');
  });

  it('renders system event without actor', () => {
    render(<AuditLogEntry action="System cleanup ran" timestamp={new Date()} />);
    expect(screen.getByText('System cleanup ran')).toBeInTheDocument();
  });

  it('truncates long names with title attribute', () => {
    const longName = 'A Very Long Name';
    render(<AuditLogEntry {...baseProps} actorName={longName} />);
    const el = screen.getByText(longName);
    expect(el).toHaveAttribute('title', longName);
    expect(el).toHaveClass('truncate');
  });
});
