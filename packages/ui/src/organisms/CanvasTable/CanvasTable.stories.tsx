import type { Meta, StoryObj } from '@storybook/react-vite';
import { CanvasTable } from './CanvasTable';

interface SampleRow {
  id: string;
  name: string;
  status: string;
  date: string;
  priority: string;
}

const columns = [
  { id: 'name', header: 'Name', accessor: 'name' as keyof SampleRow, sortable: true },
  { id: 'status', header: 'Status', accessor: 'status' as keyof SampleRow, sortable: true },
  { id: 'date', header: 'Date', accessor: 'date' as keyof SampleRow, sortable: true },
  { id: 'priority', header: 'Priority', accessor: 'priority' as keyof SampleRow },
];

const sampleData: SampleRow[] = [
  { id: '1', name: 'Script Breakdown', status: 'Active', date: '2026-01-15', priority: 'High' },
  { id: '2', name: 'Location Scouting', status: 'Completed', date: '2026-02-20', priority: 'Medium' },
  { id: '3', name: 'Casting Session', status: 'Active', date: '2026-03-01', priority: 'High' },
  { id: '4', name: 'Budget Review', status: 'Pending', date: '2026-03-10', priority: 'Low' },
  { id: '5', name: 'Equipment Check', status: 'Active', date: '2026-03-12', priority: 'Medium' },
];

const meta: Meta<typeof CanvasTable<SampleRow>> = {
  title: 'Organisms/CanvasTable',
  component: CanvasTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

type Story = StoryObj<typeof CanvasTable<SampleRow>>;

export const Default: Story = {
  args: {
    columns,
    data: sampleData,
    caption: 'Production tasks',
  },
};

export const WithExport: Story = {
  args: {
    columns,
    data: sampleData,
    caption: 'Production tasks',
    onExportCSV: () => alert('Exporting CSV...'),
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [],
    loading: true,
    caption: 'Loading tasks',
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: 'No tasks found. Create one to get started.',
    caption: 'Empty table',
  },
};

export const WithPagination: Story = {
  args: {
    columns,
    data: sampleData,
    caption: 'Paginated tasks',
    page: 1,
    totalPages: 5,
    pageSize: 25,
    onPageChange: (page: number) => alert(`Page ${page}`),
  },
};

export const WithSelection: Story = {
  args: {
    columns,
    data: sampleData,
    caption: 'Selectable tasks',
    selectionMode: 'multi',
    selectedIds: new Set(['1', '3']),
    onSelectionChange: (ids: Set<string | number>) => console.log('Selected:', ids),
  },
};
