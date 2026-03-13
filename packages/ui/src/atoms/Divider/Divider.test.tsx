import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Divider } from "./Divider";

describe("Divider", () => {
  it("renders without errors", () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("has role='separator'", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("has aria-orientation='horizontal' by default", () => {
    render(<Divider />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("has aria-orientation='vertical' when vertical", () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("renders label text when provided", () => {
    render(<Divider label="OR" />);
    expect(screen.getByText("OR")).toBeInTheDocument();
  });

  it("renders as hr for horizontal without label", () => {
    const { container } = render(<Divider />);
    expect(container.querySelector("hr")).toBeInTheDocument();
  });

  it("applies dashed variant styling", () => {
    const { container } = render(<Divider variant="dashed" />);
    const hr = container.querySelector("hr");
    expect(hr?.className).toContain("border-dashed");
  });

  it("renders vertical divider as a span", () => {
    const { container } = render(<Divider orientation="vertical" />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });
});
