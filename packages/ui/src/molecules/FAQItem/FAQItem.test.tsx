import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FAQItem } from "./FAQItem";

describe("FAQItem", () => {
  it("renders question", () => {
    render(<FAQItem question="What is Production City?" answer="A creative campus." />);
    expect(screen.getByText("What is Production City?")).toBeInTheDocument();
  });

  it("hides answer by default", () => {
    render(<FAQItem question="Q?" answer="A." />);
    const region = screen.getByRole("region", { hidden: true });
    expect(region).toHaveAttribute("hidden");
  });

  it("expands answer on click", async () => {
    const user = userEvent.setup();
    render(<FAQItem question="Q?" answer="A." />);
    await user.click(screen.getByRole("button"));
    const region = screen.getByRole("region");
    expect(region).not.toHaveAttribute("hidden");
  });

  it("collapses answer on second click", async () => {
    const user = userEvent.setup();
    render(<FAQItem question="Q?" answer="A." />);
    const button = screen.getByRole("button");
    await user.click(button);
    await user.click(button);
    const region = screen.getByRole("region", { hidden: true });
    expect(region).toHaveAttribute("hidden");
  });

  it("sets aria-expanded correctly", async () => {
    const user = userEvent.setup();
    render(<FAQItem question="Q?" answer="A." />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("renders defaultOpen when specified", () => {
    render(<FAQItem question="Q?" answer="A." defaultOpen />);
    const region = screen.getByRole("region");
    expect(region).not.toHaveAttribute("hidden");
  });

  it("merges custom className", () => {
    const { container } = render(<FAQItem question="Q?" answer="A." className="custom" />);
    expect(container.firstElementChild?.getAttribute("class")).toContain("custom");
  });
});
