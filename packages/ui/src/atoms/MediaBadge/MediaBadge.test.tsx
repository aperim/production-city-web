import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MediaBadge } from "./MediaBadge";

describe("MediaBadge", () => {
  it("renders ai-assisted variant with correct aria-label", () => {
    render(<MediaBadge variant="ai-assisted" />);
    const badge = screen.getByLabelText("AI-assisted media");
    expect(badge).toBeInTheDocument();
  });

  it("renders ai-generated variant with correct aria-label", () => {
    render(<MediaBadge variant="ai-generated" />);
    const badge = screen.getByLabelText("AI-generated media");
    expect(badge).toBeInTheDocument();
  });

  it("renders first-nations variant with correct aria-label", () => {
    render(<MediaBadge variant="first-nations" />);
    const badge = screen.getByLabelText("First Nations cultural permission");
    expect(badge).toBeInTheDocument();
  });

  it("renders distinct icon SVG for each variant", () => {
    const { rerender, container } = render(<MediaBadge variant="ai-assisted" />);
    const svg1 = container.querySelector("svg")?.innerHTML;

    rerender(<MediaBadge variant="ai-generated" />);
    const svg2 = container.querySelector("svg")?.innerHTML;

    rerender(<MediaBadge variant="first-nations" />);
    const svg3 = container.querySelector("svg")?.innerHTML;

    expect(svg1).not.toBe(svg2);
    expect(svg2).not.toBe(svg3);
  });

  it("shows tooltip text on hover", async () => {
    const user = userEvent.setup();
    render(<MediaBadge variant="ai-assisted" />);
    const badge = screen.getByLabelText("AI-assisted media");
    await user.hover(badge);
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "This media was created with AI assistance",
    );
  });

  it("shows tooltip on keyboard focus", async () => {
    const user = userEvent.setup();
    render(<MediaBadge variant="ai-generated" />);
    await user.tab();
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "This media was generated entirely by AI",
    );
  });

  it("applies sm size class", () => {
    render(<MediaBadge variant="ai-assisted" size="sm" />);
    const badge = screen.getByLabelText("AI-assisted media");
    expect(badge.className).toContain("h-5");
  });

  it("applies md size class by default", () => {
    render(<MediaBadge variant="ai-assisted" />);
    const badge = screen.getByLabelText("AI-assisted media");
    expect(badge.className).toContain("h-6");
  });

  it("renders as a button element for keyboard accessibility", () => {
    render(<MediaBadge variant="ai-assisted" />);
    const badge = screen.getByLabelText("AI-assisted media");
    expect(badge.tagName).toBe("BUTTON");
  });

  it("merges custom className", () => {
    render(<MediaBadge variant="ai-assisted" className="custom-test" />);
    const badge = screen.getByLabelText("AI-assisted media");
    expect(badge.className).toContain("custom-test");
  });
});
