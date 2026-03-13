import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type DataTableColumn } from './DataTable';

interface Row {
  id: number;
  name: string;
  status: string;
}

const columns: DataTableColumn<Row>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'status', header: 'Status', accessor: 'status' },
];

const data: Row[] = [
  { id: 1, name: 'Alice', status: 'active' },
  { id: 2, name: 'Bob', status: 'inactive' },
  { id: 3, name: 'Charlie', status: 'active' },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders row data', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows skeleton rows when loading', () => {
    render(<DataTable columns={columns} data={[]} loading={true} />);
    const cells = document.querySelectorAll('.animate-pulse');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('shows empty state when no data', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText(/no data to display/i)).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<DataTable columns={columns} data={[]} error="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders caption as screen-reader only text', () => {
    render(<DataTable columns={columns} data={data} caption="Users table" />);
    const caption = screen.getByText('Users table');
    expect(caption.tagName).toBe('CAPTION');
  });

  it('calls onSortChange when sortable column header clicked', async () => {
    const onSortChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        sortState={{ columnId: '', direction: null }}
        onSortChange={onSortChange}
      />,
    );
    await userEvent.click(screen.getByText('Name'));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'name', direction: 'asc' });
  });

  it('cycles sort direction asc → desc → null', async () => {
    const onSortChange = vi.fn();
    const { rerender } = render(
      <DataTable
        columns={columns}
        data={data}
        sortState={{ columnId: 'name', direction: 'asc' }}
        onSortChange={onSortChange}
      />,
    );
    await userEvent.click(screen.getByText('Name'));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'name', direction: 'desc' });

    rerender(
      <DataTable
        columns={columns}
        data={data}
        sortState={{ columnId: 'name', direction: 'desc' }}
        onSortChange={onSortChange}
      />,
    );
    await userEvent.click(screen.getByText('Name'));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'name', direction: null });
  });

  it('renders multi-select checkboxes', () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        selectionMode="multi"
        selectedIds={new Set()}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox').length).toBe(4); // header + 3 rows
  });

  it('calls onSelectionChange when row checkbox clicked', async () => {
    const onSelectionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        selectionMode="multi"
        selectedIds={new Set()}
        onSelectionChange={onSelectionChange}
      />,
    );
    await userEvent.click(screen.getByLabelText('Select row 1'));
    expect(onSelectionChange).toHaveBeenCalledWith(new Set([1]));
  });

  it('renders expand button and expanded content', async () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        expandedRowRenderer={(row) => <div>Expanded: {row.name}</div>}
      />,
    );
    const expandBtns = screen.getAllByRole('button', { name: 'Expand row' });
    await userEvent.click(expandBtns[0]!);
    expect(screen.getByText('Expanded: Alice')).toBeInTheDocument();
  });

  it('renders row actions', async () => {
    const onEdit = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        rowActions={[{ label: 'Edit', onClick: onEdit }]}
      />,
    );
    const editBtns = screen.getAllByRole('button', { name: 'Edit' });
    await userEvent.click(editBtns[0]!);
    expect(onEdit).toHaveBeenCalledWith(data[0]);
  });

  it('renders pagination controls', async () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        page={2}
        totalPages={5}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables Previous page on first page', () => {
    render(
      <DataTable
        columns={columns}
        data={data}
        page={1}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('uses custom cell renderer', () => {
    const customCols: DataTableColumn<Row>[] = [
      {
        id: 'name',
        header: 'Name',
        accessor: (row) => <strong data-testid="custom">{row.name}</strong>,
      },
    ];
    render(<DataTable columns={customCols} data={data} />);
    expect(screen.getAllByTestId('custom').length).toBe(3);
  });

  it('applies compact density class', () => {
    render(<DataTable columns={columns} data={data} density="compact" />);
    const tds = document.querySelectorAll('td');
    expect(tds[0]!.className).toContain('py-1.5');
  });

  it('renders aria-busy="true" when loading', () => {
    render(<DataTable columns={columns} data={[]} loading={true} />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });
});
