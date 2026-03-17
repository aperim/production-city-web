import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EoiCanvas } from './EoiCanvas';
import type { EoiTableItem, EoiPagination } from '../EoiTable/EoiTable';

const mockItems: EoiTableItem[] = [
  { id: '1', name: 'Test User', email: 'test@test.com', category: 'general', status: 'new', locale: 'en', sourcePage: '/contact', createdAt: '2026-03-01' },
  { id: '2', name: 'Another User', email: 'another@test.com', category: 'producer', status: 'contacted', locale: 'en', sourcePage: '/about', createdAt: '2026-03-02' },
];

const mockPagination: EoiPagination = {
  page: 1,
  totalPages: 1,
  total: 2,
  limit: 25,
};

describe('EoiCanvas', () => {
  const defaultProps = {
    items: mockItems,
    pagination: mockPagination,
    onPageChange: vi.fn(),
    onSearch: vi.fn(),
    onCategoryFilter: vi.fn(),
    onStatusFilter: vi.fn(),
    hasPermission: true,
  };

  it('renders EOI table with items', () => {
    render(<EoiCanvas {...defaultProps} />);
    expect(screen.getByText('Test User')).toBeDefined();
    expect(screen.getByText('Another User')).toBeDefined();
  });

  it('renders access-denied when no permission', () => {
    render(<EoiCanvas {...defaultProps} hasPermission={false} />);
    expect(screen.getByText(/no access/i)).toBeDefined();
  });

  it('renders loading state', () => {
    render(<EoiCanvas {...defaultProps} loading />);
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it('renders error state', () => {
    render(<EoiCanvas {...defaultProps} error="Failed to load EOI" />);
    expect(screen.getByText('Failed to load EOI')).toBeDefined();
  });

  it('renders empty state when no items', () => {
    render(<EoiCanvas {...defaultProps} items={[]} />);
    expect(screen.getByText(/no expressions of interest/i)).toBeDefined();
  });

  it('opens detail panel when row is clicked', () => {
    const onRowClick = vi.fn();
    render(<EoiCanvas {...defaultProps} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Test User'));
    expect(onRowClick).toHaveBeenCalledWith('1');
  });

  it('renders detail panel when selectedEoi is provided', () => {
    render(
      <EoiCanvas
        {...defaultProps}
        selectedEoi={{
          id: '1',
          name: 'Test User',
          email: 'test@test.com',
          category: 'general',
          status: 'new',
          locale: 'en',
          sourcePage: '/contact',
          sourceCategory: null,
          message: 'Hello',
          metadata: null,
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          consentVersion: '1.0',
          privacyAcceptedAt: '2026-03-01',
          marketingOptIn: false,
          confirmationSentAt: null,
          createdAt: '2026-03-01',
          updatedAt: '2026-03-01',
          archivedAt: null,
        }}
        onDetailClose={vi.fn()}
      />,
    );
    expect(screen.getByText('EOI Detail')).toBeDefined();
  });

  it('calls onDetailClose when detail panel is closed', () => {
    const onDetailClose = vi.fn();
    render(
      <EoiCanvas
        {...defaultProps}
        selectedEoi={{
          id: '1',
          name: 'Test User',
          email: 'test@test.com',
          category: 'general',
          status: 'new',
          locale: 'en',
          sourcePage: '/contact',
          sourceCategory: null,
          message: null,
          metadata: null,
          utmSource: null,
          utmMedium: null,
          utmCampaign: null,
          consentVersion: '1.0',
          privacyAcceptedAt: '2026-03-01',
          marketingOptIn: false,
          confirmationSentAt: null,
          createdAt: '2026-03-01',
          updatedAt: '2026-03-01',
          archivedAt: null,
        }}
        onDetailClose={onDetailClose}
      />,
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onDetailClose).toHaveBeenCalled();
  });
});
