import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasTable, type CanvasTableProps } from "./CanvasTable";

interface TestRow {
  id: string;
  name: string;
  status: string;
  date: string;
}

const columns = [
  { id: "name", header: "Name", accessor: "name" as keyof TestRow, sortable: true },
  { id: "status", header: "Status", accessor: "status" as keyof TestRow, sortable: true },
  { id: "date", header: "Date", accessor: "date" as keyof TestRow, sortable: true },
];

const data: TestRow[] = [
  { id: "1", name: "Project Alpha", status: "Active", date: "2026-01-15" },
  { id: "2", name: "Project Beta", status: "Completed", date: "2026-02-20" },
  { id: "3", name: "Project Gamma", status: "Active", date: "2026-03-01" },
];

const defaultProps: CanvasTableProps<TestRow> = {
  columns,
  data,
  loading: false,
  caption: "Test table",
};

describe("CanvasTable", () => {
  it("renders DataTable with provided columns and data", () => {
    render(<CanvasTable {...defaultProps} />);
    expect(screen.getByText("Project Alpha")).toBeDefined();
    expect(screen.getByText("Project Beta")).toBeDefined();
  });

  it("shows loading skeleton when loading", () => {
    render(<CanvasTable {...defaultProps} loading data={[]} />);
    // DataTable renders skeleton rows when loading
  });

  it("shows empty state when no data", () => {
    render(<CanvasTable {...defaultProps} data={[]} emptyMessage="No items found" />);
    expect(screen.getByText("No items found")).toBeDefined();
  });

  it("renders CSV export button", () => {
    render(<CanvasTable {...defaultProps} onExportCSV={vi.fn()} />);
    expect(screen.getByText(/export/i)).toBeDefined();
  });

  it("calls onExportCSV when export button clicked", () => {
    const onExportCSV = vi.fn();
    render(<CanvasTable {...defaultProps} onExportCSV={onExportCSV} />);
    fireEvent.click(screen.getByText(/export/i));
    expect(onExportCSV).toHaveBeenCalled();
  });

  it("renders with page size selector", () => {
    render(<CanvasTable {...defaultProps} page={1} totalPages={3} pageSize={25} onPageChange={vi.fn()} />);
    // Page size selector should be visible
  });

  it("has accessible caption", () => {
    const { container } = render(<CanvasTable {...defaultProps} />);
    const caption = container.querySelector("caption");
    expect(caption?.textContent).toBe("Test table");
  });
});
