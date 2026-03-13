import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Stepper } from "./Stepper";

const steps = [
  { id: "s1", label: "Account details", status: "completed" as const },
  { id: "s2", label: "Personal info", status: "active" as const },
  { id: "s3", label: "Review", status: "pending" as const },
];

describe("Stepper", () => {
  it("renders all step labels", () => {
    render(<Stepper steps={steps} />);
    expect(screen.getByText("Account details")).toBeInTheDocument();
    expect(screen.getByText("Personal info")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
  });

  it("renders as an ordered list", () => {
    render(<Stepper steps={steps} />);
    expect(screen.getByRole("list", { name: "Steps" })).toBeInTheDocument();
  });

  it("renders list items", () => {
    render(<Stepper steps={steps} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("renders completed step as clickable button when onStepClick provided", () => {
    render(<Stepper steps={steps} onStepClick={() => {}} />);
    expect(screen.getByRole("button", { name: /Account details/ })).toBeInTheDocument();
  });

  it("calls onStepClick for completed step", async () => {
    const handleClick = vi.fn();
    render(<Stepper steps={steps} onStepClick={handleClick} />);
    await userEvent.click(screen.getByRole("button", { name: /Account details/ }));
    expect(handleClick).toHaveBeenCalledWith("s1");
  });

  it("does not render active/pending steps as clickable", () => {
    render(<Stepper steps={steps} onStepClick={() => {}} />);
    // Only the completed step should be a button (active and pending are not)
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
  });

  it("renders descriptions when provided", () => {
    const stepsWithDesc = [
      { id: "d1", label: "Step 1", status: "completed" as const, description: "Fill out your name" },
    ];
    render(<Stepper steps={stepsWithDesc} />);
    expect(screen.getByText("Fill out your name")).toBeInTheDocument();
  });

  it("renders checkmark for completed steps", () => {
    render(<Stepper steps={steps} />);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("renders error step with error icon", () => {
    const errorSteps = [{ id: "e1", label: "Failed", status: "error" as const }];
    render(<Stepper steps={errorSteps} />);
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("renders in vertical orientation", () => {
    const { container } = render(<Stepper steps={steps} orientation="vertical" />);
    const list = container.querySelector("ol");
    expect(list?.className).toContain("flex-col");
  });
});
