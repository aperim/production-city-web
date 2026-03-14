import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatementBlock } from "./StatementBlock";

describe("StatementBlock", () => {
  it("renders statement text", () => {
    render(<StatementBlock text="Where stories come to life" />);
    expect(screen.getByText("Where stories come to life")).toBeInTheDocument();
  });

  it("renders at display size typography", () => {
    const { container } = render(
      <StatementBlock text="Big statement" />,
    );
    const textEl = container.querySelector("[data-testid='statement-text']");
    expect(textEl).toBeInTheDocument();
    // Font size is set via inline style using the display token
    const style = textEl?.getAttribute("style") ?? "";
    expect(style).toMatch(/font-size.*display|font-size.*clamp/);
  });

  it("renders attribution when provided", () => {
    render(
      <StatementBlock
        text="Innovation through craft"
        attribution="Production City Vision"
      />,
    );
    expect(screen.getByText("Production City Vision")).toBeInTheDocument();
  });

  it("applies primary accent variant", () => {
    const { container } = render(
      <StatementBlock text="Statement" accent="primary" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/primary/);
  });

  it("applies secondary accent variant", () => {
    const { container } = render(
      <StatementBlock text="Statement" accent="secondary" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/secondary/);
  });
});
