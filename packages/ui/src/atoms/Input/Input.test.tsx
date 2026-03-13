import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders without errors", () => {
    render(<Input label="Name" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("associates label with input via htmlFor", () => {
    render(<Input label="Email" id="email-input" />);
    const label = screen.getByText("Email");
    const input = screen.getByRole("textbox");
    expect(label).toHaveAttribute("for", "email-input");
    expect(input).toHaveAttribute("id", "email-input");
  });

  it("auto-generates id when not provided", () => {
    render(<Input label="Name" />);
    const label = screen.getByText("Name");
    const input = screen.getByRole("textbox");
    const forAttr = label.getAttribute("for");
    expect(forAttr).toBeTruthy();
    expect(input.getAttribute("id")).toBe(forAttr);
  });

  it("shows helper text when no error", () => {
    render(<Input label="Name" helperText="Enter your full name" />);
    expect(screen.getByText("Enter your full name")).toBeInTheDocument();
  });

  it("shows error message and sets aria-invalid", () => {
    render(<Input label="Email" errorMessage="Invalid email" />);
    const input = screen.getByRole("textbox");
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("hides helper text when error is present", () => {
    render(
      <Input
        label="Email"
        helperText="We never share your email"
        errorMessage="Invalid email"
      />,
    );
    expect(screen.queryByText("We never share your email")).not.toBeInTheDocument();
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("renders disabled state", () => {
    render(<Input label="Name" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("renders readonly state", () => {
    render(<Input label="Name" readOnly defaultValue="Read only value" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });

  it("renders password type", () => {
    const { container } = render(<Input label="Password" type="password" />);
    expect(container.querySelector("input[type='password']")).toBeInTheDocument();
  });

  it("renders search type", () => {
    const { container } = render(<Input label="Search" type="search" />);
    expect(container.querySelector("input[type='search']")).toBeInTheDocument();
  });

  it("renders left and right icon slots", () => {
    render(
      <Input
        label="Search"
        leftIcon={<span data-testid="left-icon" />}
        rightIcon={<span data-testid="right-icon" />}
      />,
    );
    expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("right-icon")).toBeInTheDocument();
  });

  it("fires onChange when value changes", async () => {
    const handleChange = vi.fn();
    render(<Input label="Name" onChange={handleChange} />);
    await userEvent.type(screen.getByRole("textbox"), "Hello");
    expect(handleChange).toHaveBeenCalled();
  });

  it("forwards ref to input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input label="Name" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("does not fire onChange when disabled", async () => {
    const handleChange = vi.fn();
    render(<Input label="Name" disabled onChange={handleChange} />);
    await userEvent.type(screen.getByRole("textbox"), "Hello");
    expect(handleChange).not.toHaveBeenCalled();
  });
});
