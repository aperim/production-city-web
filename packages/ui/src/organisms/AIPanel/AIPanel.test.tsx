import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AIPanel } from "./AIPanel";

describe("AIPanel", () => {
  it("renders toggle button when closed", () => {
    render(<AIPanel />);
    expect(screen.getByLabelText("Open AI assistant")).toBeDefined();
  });

  it("calls onToggle when toggle button clicked", () => {
    const onToggle = vi.fn();
    render(<AIPanel onToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText("Open AI assistant"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("renders panel when open", () => {
    render(<AIPanel open />);
    expect(screen.getByLabelText("AI assistant")).toBeDefined();
    expect(screen.getByText("Assistant")).toBeDefined();
  });

  it("renders close button when open", () => {
    const onToggle = vi.fn();
    render(<AIPanel open onToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText("Close AI assistant"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("renders empty state when no messages", () => {
    render(<AIPanel open />);
    expect(screen.getByText("Ask a question about your workspace")).toBeDefined();
  });

  it("renders messages", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "Hello", timestamp: new Date().toISOString() },
      { id: "2", role: "assistant" as const, content: "Hi there", timestamp: new Date().toISOString() },
    ];
    render(<AIPanel open messages={messages} />);
    expect(screen.getByText("Hello")).toBeDefined();
    expect(screen.getByText("Hi there")).toBeDefined();
  });

  it("calls onSend when form submitted", () => {
    const onSend = vi.fn();
    render(<AIPanel open onSend={onSend} />);
    const input = screen.getByLabelText("Message input");
    fireEvent.change(input, { target: { value: "test message" } });
    fireEvent.submit(input.closest("form")!);
    expect(onSend).toHaveBeenCalledWith("test message");
  });

  it("clears input after sending", () => {
    const onSend = vi.fn();
    render(<AIPanel open onSend={onSend} />);
    const input = screen.getByLabelText("Message input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.submit(input.closest("form")!);
    expect(input.value).toBe("");
  });

  it("does not send empty messages", () => {
    const onSend = vi.fn();
    render(<AIPanel open onSend={onSend} />);
    const input = screen.getByLabelText("Message input");
    fireEvent.submit(input.closest("form")!);
    expect(onSend).not.toHaveBeenCalled();
  });

  it("shows loading state", () => {
    render(<AIPanel open loading />);
    expect(screen.getByText("Thinking...")).toBeDefined();
  });

  it("disables input when loading", () => {
    render(<AIPanel open loading />);
    const input = screen.getByLabelText("Message input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
