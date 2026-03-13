import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon";

const TestSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
);

describe("Icon", () => {
  it("renders children", () => {
    const { container } = render(
      <Icon>
        <TestSvg />
      </Icon>,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("is aria-hidden when no label provided (decorative)", () => {
    const { container } = render(
      <Icon>
        <TestSvg />
      </Icon>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });

  it("has role=img and aria-label when label is provided", () => {
    render(
      <Icon label="Home">
        <TestSvg />
      </Icon>,
    );
    expect(screen.getByRole("img", { name: "Home" })).toBeInTheDocument();
  });

  it("applies size classes", () => {
    const { container } = render(
      <Icon size="lg">
        <TestSvg />
      </Icon>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("h-6");
    expect(wrapper.className).toContain("w-6");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Icon className="text-primary">
        <TestSvg />
      </Icon>,
    );
    expect((container.firstChild as HTMLElement).className).toContain("text-primary");
  });
});
