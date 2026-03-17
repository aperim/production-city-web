import type { Meta, StoryObj } from '@storybook/react-vite';
import { CanvasDocuments } from './CanvasDocuments';

const meta: Meta<typeof CanvasDocuments> = {
  title: 'Organisms/CanvasDocuments',
  component: CanvasDocuments,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CanvasDocuments>;

const sampleItems = [
  { id: '1', name: 'Q1 Financial Report.pdf', type: 'file' as const, fileType: 'pdf', size: 1024000, updatedAt: '2026-03-01T10:00:00Z' },
  { id: '2', name: 'Contracts', type: 'folder' as const, childCount: 8 },
  { id: '3', name: 'Script Draft v3.docx', type: 'file' as const, fileType: 'docx', size: 245000, updatedAt: '2026-02-28T09:15:00Z' },
  { id: '4', name: 'Storyboards', type: 'folder' as const, childCount: 24 },
  { id: '5', name: 'Budget.xlsx', type: 'file' as const, fileType: 'xlsx', size: 512000, updatedAt: '2026-03-10T14:30:00Z' },
  { id: '6', name: 'Location Photos', type: 'folder' as const, childCount: 156 },
  { id: '7', name: 'Pitch Deck.pptx', type: 'file' as const, fileType: 'pptx', size: 5120000, updatedAt: '2026-02-15T11:00:00Z' },
];

export const Default: Story = {
  args: {
    items: sampleItems,
    currentPath: '/',
    sortBy: 'name',
    sortDirection: 'asc',
  },
};

export const Empty: Story = {
  args: {
    items: [],
    currentPath: '/Documents',
    sortBy: 'name',
    sortDirection: 'asc',
  },
};

export const FilesOnly: Story = {
  args: {
    items: sampleItems.filter((i) => i.type === 'file'),
    currentPath: '/Reports',
    sortBy: 'date',
    sortDirection: 'desc',
  },
};

export const FoldersOnly: Story = {
  args: {
    items: sampleItems.filter((i) => i.type === 'folder'),
    currentPath: '/',
    sortBy: 'name',
    sortDirection: 'asc',
  },
};
