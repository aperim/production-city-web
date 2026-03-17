import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasCatalog, type CanvasCatalogProps } from "./CanvasCatalog";

const defaultProps: CanvasCatalogProps = {
  items: [
    { id: "1", title: "Film Production 101", subtitle: "Beginner course", tags: ["Film", "Beginner"], imageUrl: "/img/course1.jpg" },
    { id: "2", title: "Advanced VFX", subtitle: "Expert workshop", tags: ["VFX", "Advanced"] },
  ],
  categories: ["Film", "VFX", "Sound", "Beginner", "Advanced"],
  onItemClick: vi.fn(),
  onSearch: vi.fn(),
  onCategoryFilter: vi.fn(),
};

describe("CanvasCatalog", () => {
  it("renders catalog items", () => {
    render(<CanvasCatalog {...defaultProps} />);
    expect(screen.getByText("Film Production 101")).toBeDefined();
    expect(screen.getByText("Advanced VFX")).toBeDefined();
  });

  it("renders search input", () => {
    render(<CanvasCatalog {...defaultProps} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeDefined();
  });

  it("renders category filter chips", () => {
    render(<CanvasCatalog {...defaultProps} />);
    // Categories appear as both tags and filter chips, so multiple matches expected
    expect(screen.getAllByText("Film").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("VFX").length).toBeGreaterThanOrEqual(1);
    // "Sound" only in categories, not in item tags
    expect(screen.getByText("Sound")).toBeDefined();
  });

  it("calls onItemClick when card is clicked", () => {
    const onItemClick = vi.fn();
    render(<CanvasCatalog {...defaultProps} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText("Film Production 101"));
    expect(onItemClick).toHaveBeenCalledWith("1");
  });

  it("renders empty state", () => {
    render(<CanvasCatalog {...defaultProps} items={[]} emptyMessage="No courses found" />);
    expect(screen.getByText("No courses found")).toBeDefined();
  });

  it("renders CTA button when provided", () => {
    const items = [{ id: "1", title: "Course", subtitle: "Sub", tags: [], ctaLabel: "Enroll Now" }];
    render(<CanvasCatalog {...defaultProps} items={items} />);
    expect(screen.getByText("Enroll Now")).toBeDefined();
  });

  it("filters items by search query", () => {
    render(<CanvasCatalog {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: "VFX" } });
    expect(screen.queryByText("Film Production 101")).toBeNull();
    expect(screen.getByText("Advanced VFX")).toBeDefined();
  });

  it("renders subtitle text", () => {
    render(<CanvasCatalog {...defaultProps} />);
    expect(screen.getByText("Beginner course")).toBeDefined();
  });
});
