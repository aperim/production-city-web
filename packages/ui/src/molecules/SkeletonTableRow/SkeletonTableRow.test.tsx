import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkeletonTableRow } from "./SkeletonTableRow";

function renderInTable(ui: React.ReactNode) {
  return render(<table><tbody>{ui}</tbody></table>);
}

describe("SkeletonTableRow", () => {
  it("renders without errors", () => {
    const { container } = renderInTable(<SkeletonTableRow />);
    expect(container.querySelector("tr")).toBeInTheDocument();
  });

  it("is aria-hidden for accessibility", () => {
    const { container } = renderInTable(<SkeletonTableRow />);
    expect(container.querySelector("tr")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders 4 cells by default", () => {
    const { container } = renderInTable(<SkeletonTableRow />);
    const cells = container.querySelectorAll("td");
    expect(cells.length).toBe(4);
  });

  it("renders specified number of cells", () => {
    const { container } = renderInTable(<SkeletonTableRow columns={6} />);
    const cells = container.querySelectorAll("td");
    expect(cells.length).toBe(6);
  });

  it("contains skeleton elements in each cell", () => {
    const { container } = renderInTable(<SkeletonTableRow columns={3} />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"] [aria-hidden="true"]');
    expect(skeletons.length).toBe(3);
  });
});
