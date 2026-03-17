import type { Meta, StoryObj } from '@storybook/react-vite';
import { EoiCanvas, type EoiCanvasProps } from './EoiCanvas';
import type { EoiTableItem, EoiPagination } from '../EoiTable/EoiTable';
import type { EoiDetail } from '../EoiDetailPanel/EoiDetailPanel';

const mockItems: EoiTableItem[] = [
  { id: '1', name: 'Test Producer', email: 'producer@example.com', category: 'producer', status: 'new', locale: 'en', sourcePage: '/services', createdAt: '2026-03-01' },
  { id: '2', name: 'Creative Studio', email: 'studio@example.com', category: 'creative', status: 'contacted', locale: 'en', sourcePage: '/about', createdAt: '2026-03-02' },
  { id: '3', name: 'Investment Corp', email: 'invest@example.com', category: 'investor', status: 'converted', locale: 'en', sourcePage: '/invest', createdAt: '2026-02-15' },
  { id: '4', name: 'Local School', email: 'school@example.com', category: 'education', status: 'new', locale: 'en', sourcePage: '/education', createdAt: '2026-03-10' },
];

const mockPagination: EoiPagination = { page: 1, totalPages: 2, total: 8, limit: 4 };

const mockDetail: EoiDetail = {
  id: '1',
  name: 'Test Producer',
  email: 'producer@example.com',
  category: 'producer',
  status: 'new',
  locale: 'en',
  sourcePage: '/services',
  sourceCategory: 'production',
  message: 'Interested in studio space for upcoming film production.',
  metadata: null,
  utmSource: 'google',
  utmMedium: 'cpc',
  utmCampaign: 'studio-2026',
  consentVersion: '2.0',
  privacyAcceptedAt: '2026-03-01T10:00:00Z',
  marketingOptIn: true,
  confirmationSentAt: '2026-03-01T10:01:00Z',
  createdAt: '2026-03-01T10:00:00Z',
  updatedAt: '2026-03-01T10:00:00Z',
  archivedAt: null,
};

const baseProps: EoiCanvasProps = {
  items: mockItems,
  pagination: mockPagination,
  onPageChange: () => {},
  onSearch: () => {},
  onCategoryFilter: () => {},
  onStatusFilter: () => {},
  hasPermission: true,
};

const meta: Meta<typeof EoiCanvas> = {
  title: 'Organisms/EoiCanvas',
  component: EoiCanvas,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div style={{ height: '600px' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof EoiCanvas>;

export const Default: Story = {
  args: baseProps,
};

export const WithDetailOpen: Story = {
  args: {
    ...baseProps,
    selectedEoi: mockDetail,
    onDetailClose: () => {},
    onStatusUpdate: () => {},
    canUpdateStatus: true,
  },
  name: 'Detail Panel Open',
};

export const Empty: Story = {
  args: {
    ...baseProps,
    items: [],
    pagination: { page: 1, totalPages: 0, total: 0, limit: 25 },
  },
  name: 'No EOIs',
};

export const Loading: Story = {
  args: { ...baseProps, loading: true },
};

export const Error: Story = {
  args: { ...baseProps, error: 'Failed to load expressions of interest' },
};

export const AccessDenied: Story = {
  args: { ...baseProps, hasPermission: false },
  name: 'Access Denied',
};

export const Filtered: Story = {
  args: {
    ...baseProps,
    items: mockItems.filter((i) => i.category === 'producer'),
  },
  name: 'Filtered (producers)',
};
