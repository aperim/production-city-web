import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders without errors", () => {
    render(<Textarea label="Message" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("associates label with textarea", () => {
    render(<Textarea label="Message" id="msg" />);
    expect(screen.getByText("Message")).toHaveAttribute("for", "msg");
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "msg");
  });

  it("auto-generates id when not provided", () => {
    render(<Textarea label="Message" />);
    const label = screen.getByText("Message");
    const textarea = screen.getByRole("textbox");
    const forAttr = label.getAttribute("for");
    expect(forAttr).toBeTruthy();
    expect(textarea.getAttribute("id")).toBe(forAttr);
  });

  it("shows helper text", () => {
    render(<Textarea label="Bio" helperText="Max 500 characters" />);
    expect(screen.getByText("Max 500 characters")).toBeInTheDocument();
  });

  it("shows error message and sets aria-invalid", () => {
    render(<Textarea label="Bio" errorMessage="Too short" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Too short")).toBeInTheDocument();
  });

  it("shows character counter when maxLength is set", () => {
    render(<Textarea label="Bio" maxLength={200} defaultValue="Hello" />);
    expect(screen.getByText("5/200")).toBeInTheDocument();
  });

  it("renders disabled state", () => {
    render(<Textarea label="Bio" disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("renders readonly state", () => {
    render(<Textarea label="Bio" readOnly defaultValue="Read only" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });

  it("fires onChange when typing", async () => {
    const handleChange = vi.fn();
    render(<Textarea label="Bio" onChange={handleChange} />);
    await userEvent.type(screen.getByRole("textbox"), "Hello");
    expect(handleChange).toHaveBeenCalled();
  });

  it("forwards ref to textarea element", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea label="Bio" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("renders minRows as rows attribute", () => {
    render(<Textarea label="Bio" minRows={5} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");
  });
});
