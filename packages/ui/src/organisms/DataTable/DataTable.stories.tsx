import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DataTable, type DataTableColumn, type SortState } from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'Organisms/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'DataTable organism: sortable columns, row selection, expansion, pagination, column toggle. WCAG 2.2 AA.',
      },
    },
  },
};

export default meta;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const columns: DataTableColumn<User>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'email', header: 'Email', accessor: 'email', sortable: true },
  { id: 'role', header: 'Role', accessor: 'role' },
  {
    id: 'status',
    header: 'Status',
    accessor: (row) => (
      <span
        className={
          row.status === 'active'
            ? 'text-green-700 text-xs font-medium'
            : 'text-muted-foreground text-xs'
        }
      >
        {row.status}
      </span>
    ),
  },
];

const data: User[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Adams'][i % 5] as string,
  email: `user${i + 1}@example.com`,
  role: ['Admin', 'Editor', 'Viewer'][i % 3] as string,
  status: i % 3 === 2 ? 'inactive' : 'active',
}));

export const Default: StoryObj = {
  render: () => <DataTable columns={columns} data={data.slice(0, 5)} caption="Users" />,
};

export const Loading: StoryObj = {
  render: () => <DataTable columns={columns} data={[]} loading={true} caption="Loading users" />,
};

export const Empty: StoryObj = {
  render: () => <DataTable columns={columns} data={[]} caption="Empty table" />,
};

export const Error: StoryObj = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      error="Failed to load users. Please try again."
      caption="Error state"
    />
  ),
};

export const WithSorting: StoryObj = {
  render: () => {
    const [sortState, setSortState] = useState<SortState>({ columnId: '', direction: null });
    const sorted = [...data.slice(0, 8)].sort((a, b) => {
      if (!sortState.direction) return 0;
      const key = sortState.columnId as keyof User;
      const av = String(a[key]);
      const bv = String(b[key]);
      return sortState.direction === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return (
      <DataTable
        columns={columns}
        data={sorted}
        sortState={sortState}
        onSortChange={setSortState}
        caption="Sortable users"
      />
    );
  },
};

export const WithMultiSelect: StoryObj = {
  render: () => {
    const [selected, setSelected] = useState<Set<string | number>>(new Set());
    return (
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Selected: {[...selected].join(', ') || 'none'}</p>
        <DataTable
          columns={columns}
          data={data.slice(0, 6)}
          selectionMode="multi"
          selectedIds={selected}
          onSelectionChange={setSelected}
          caption="Selectable users"
        />
      </div>
    );
  },
};

export const WithPagination: StoryObj = {
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 5;
    const totalPages = Math.ceil(data.length / pageSize);
    const pageData = data.slice((page - 1) * pageSize, page * pageSize);
    return (
      <DataTable
        columns={columns}
        data={pageData}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        caption="Paginated users"
      />
    );
  },
};

export const WithExpandedRows: StoryObj = {
  render: () => (
    <DataTable
      columns={columns}
      data={data.slice(0, 5)}
      expandedRowRenderer={(row) => (
        <div className="text-sm text-muted-foreground py-2">
          <strong>ID:</strong> {row.id} &nbsp; <strong>Email:</strong> {row.email}
        </div>
      )}
      caption="Expandable users"
    />
  ),
};

export const WithColumnToggle: StoryObj = {
  render: () => (
    <DataTable
      columns={columns}
      data={data.slice(0, 5)}
      showColumnToggle={true}
      caption="Users with column toggle"
    />
  ),
};

export const Compact: StoryObj = {
  render: () => (
    <DataTable
      columns={columns}
      data={data.slice(0, 8)}
      density="compact"
      caption="Compact density users"
    />
  ),
};
