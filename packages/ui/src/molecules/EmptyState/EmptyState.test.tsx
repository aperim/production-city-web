import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No results found" />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="No data" description="Try adjusting your filters." />);
    expect(screen.getByText("Try adjusting your filters.")).toBeInTheDocument();
  });

  it("does not render description when omitted", () => {
    render(<EmptyState title="No data" />);
    expect(screen.queryByText("Try adjusting your filters.")).not.toBeInTheDocument();
  });

  it("renders illustration when provided", () => {
    render(
      <EmptyState
        title="Empty"
        illustration={<span>📭</span>}
      />,
    );
    expect(screen.getByText("📭")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        title="No projects"
        action={<button>Create project</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Create project" })).toBeInTheDocument();
  });

  it("applies page variant padding by default", () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(container.firstChild).toHaveClass("py-16");
  });

  it("applies inline variant compact padding", () => {
    const { container } = render(<EmptyState title="Empty" variant="inline" />);
    expect(container.firstChild).toHaveClass("py-8");
  });

  it("renders ReactNode in title", () => {
    render(<EmptyState title={<strong>No items</strong>} />);
    expect(screen.getByText("No items")).toBeInTheDocument();
  });
});
