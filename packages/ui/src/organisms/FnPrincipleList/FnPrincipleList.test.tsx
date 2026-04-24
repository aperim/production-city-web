import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FnPrincipleList } from "./FnPrincipleList";

const items = [
  { number: "01", children: <><strong>Free, prior, and informed consent</strong> is required.</> },
  { number: "02", children: <><strong>Provenance is tracked.</strong> End-to-end.</> },
];

describe("FnPrincipleList", () => {
  it("renders all items", () => {
    render(<FnPrincipleList items={items} />);
    expect(screen.getByText(/Free, prior, and informed consent/)).toBeInTheDocument();
    expect(screen.getByText(/Provenance is tracked\./)).toBeInTheDocument();
  });

  it("renders numbers as aria-hidden", () => {
    render(<FnPrincipleList items={items} />);
    const nums = screen.getAllByText(/^0[12]$/);
    nums.forEach((el) => expect(el).toHaveAttribute("aria-hidden", "true"));
  });

  it("renders empty list gracefully", () => {
    const { container } = render(<FnPrincipleList items={[]} />);
    expect(container.firstElementChild?.children).toHaveLength(0);
  });
});
