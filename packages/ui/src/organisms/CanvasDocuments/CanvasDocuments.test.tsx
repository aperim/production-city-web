import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasDocuments, type CanvasDocumentsProps } from "./CanvasDocuments";

const defaultProps: CanvasDocumentsProps = {
  items: [
    { id: "1", name: "Q1 Report.pdf", type: "file", fileType: "pdf", size: 1024000, updatedAt: "2026-03-01T10:00:00Z" },
    { id: "2", name: "Financial Statements", type: "folder", childCount: 12 },
    { id: "3", name: "Presentation.pptx", type: "file", fileType: "pptx", size: 5120000, updatedAt: "2026-02-15T14:30:00Z" },
  ],
  currentPath: "/",
  onItemClick: vi.fn(),
  onUpload: vi.fn(),
  onCreateFolder: vi.fn(),
  onSort: vi.fn(),
  sortBy: "name",
  sortDirection: "asc",
};

describe("CanvasDocuments", () => {
  it("renders files and folders", () => {
    render(<CanvasDocuments {...defaultProps} />);
    expect(screen.getByText("Q1 Report.pdf")).toBeDefined();
    expect(screen.getByText("Financial Statements")).toBeDefined();
  });

  it("renders folder icon for folders", () => {
    const { container } = render(<CanvasDocuments {...defaultProps} />);
    expect(container.querySelector("[data-type='folder']")).not.toBeNull();
  });

  it("calls onItemClick when file is clicked", () => {
    const onItemClick = vi.fn();
    render(<CanvasDocuments {...defaultProps} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText("Q1 Report.pdf"));
    expect(onItemClick).toHaveBeenCalledWith("1");
  });

  it("renders upload zone", () => {
    const { container } = render(<CanvasDocuments {...defaultProps} />);
    expect(container.querySelector("[data-upload-zone]")).not.toBeNull();
  });

  it("renders sort controls", () => {
    render(<CanvasDocuments {...defaultProps} />);
    expect(screen.getByText(/name/i)).toBeDefined();
  });

  it("renders empty state", () => {
    render(<CanvasDocuments {...defaultProps} items={[]} />);
    expect(screen.getByText(/no documents/i)).toBeDefined();
  });

  it("shows file size formatted", () => {
    render(<CanvasDocuments {...defaultProps} />);
    // 1024000 bytes ~ 1000.0 KB
    expect(screen.getByText(/1000\.0 KB/i)).toBeDefined();
  });

  it("shows folder child count", () => {
    render(<CanvasDocuments {...defaultProps} />);
    expect(screen.getByText("12 items")).toBeDefined();
  });

  it("renders new folder button", () => {
    render(<CanvasDocuments {...defaultProps} />);
    expect(screen.getByText("New Folder")).toBeDefined();
  });
});
