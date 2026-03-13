import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("renders navigation landmark", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("renders prev and next buttons", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeInTheDocument();
  });

  it("disables prev on first page", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("disables next on last page", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("calls onPageChange with page-1 when prev clicked", async () => {
    const handleChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={handleChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with page+1 when next clicked", async () => {
    const handleChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={handleChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("calls onPageChange with clicked page number", async () => {
    const handleChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={handleChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("marks current page with aria-current=page", () => {
    render(<Pagination page={2} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("renders all page buttons for small total", () => {
    render(<Pagination page={1} totalPages={4} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 4" })).toBeInTheDocument();
  });

  it("shows total when showTotal=true", () => {
    render(
      <Pagination
        page={1}
        totalPages={10}
        onPageChange={() => {}}
        showTotal
        totalItems={100}
        pageSize={10}
      />,
    );
    expect(screen.getByText("1–10 of 100")).toBeInTheDocument();
  });

  it("uses custom aria-label", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} aria-label="Results pages" />);
    expect(screen.getByRole("navigation", { name: "Results pages" })).toBeInTheDocument();
  });
});
