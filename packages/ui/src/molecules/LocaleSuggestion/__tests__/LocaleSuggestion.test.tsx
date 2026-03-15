/**
 * Unit tests for LocaleSuggestion molecule.
 *
 * Tests: show/hide logic, cookie handling, dismiss behavior, RTL,
 * ARIA role="status", Escape key dismiss, non-modal behavior.
 *
 * @see Issue #280, Finding #23
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocaleSuggestion } from "../LocaleSuggestion";

function clearCookies() {
  Object.defineProperty(document, "cookie", {
    writable: true,
    value: "",
  });
}

describe("LocaleSuggestion", () => {
  beforeEach(() => {
    clearCookies();
  });

  it("shows prompt when suggestedLocale differs from currentLocale", () => {
    render(
      <LocaleSuggestion
        suggestedLocale="zh"
        currentLocale="en"
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("does not show when suggestedLocale matches currentLocale", () => {
    const { container } = render(
      <LocaleSuggestion
        suggestedLocale="en"
        currentLocale="en"
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("does not show when suggestedLocale is null", () => {
    const { container } = render(
      <LocaleSuggestion
        suggestedLocale={null}
        currentLocale="en"
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("does not show when dismissed is true", () => {
    const { container } = render(
      <LocaleSuggestion
        suggestedLocale="zh"
        currentLocale="en"
        dismissed={true}
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("has role='status' for screen reader announcement (Finding #23)", () => {
    render(
      <LocaleSuggestion
        suggestedLocale="zh"
        currentLocale="en"
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("calls onDismiss when dismiss button is clicked", () => {
    const onDismiss = vi.fn();
    render(
      <LocaleSuggestion
        suggestedLocale="zh"
        currentLocale="en"
        onAccept={vi.fn()}
        onDismiss={onDismiss}
      />,
    );
    const dismissBtn = screen.getByRole("button", { name: /dismiss/i });
    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("calls onAccept with the suggested locale when accept is clicked", () => {
    const onAccept = vi.fn();
    render(
      <LocaleSuggestion
        suggestedLocale="zh"
        currentLocale="en"
        onAccept={onAccept}
        onDismiss={vi.fn()}
      />,
    );
    const acceptBtn = screen.getByRole("button", { name: /switch/i });
    fireEvent.click(acceptBtn);
    expect(onAccept).toHaveBeenCalledWith("zh");
  });

  it("dismisses on Escape key (Finding #23)", () => {
    const onDismiss = vi.fn();
    render(
      <LocaleSuggestion
        suggestedLocale="zh"
        currentLocale="en"
        onAccept={vi.fn()}
        onDismiss={onDismiss}
      />,
    );
    fireEvent.keyDown(screen.getByRole("status"), { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("displays the native language name for the suggested locale", () => {
    render(
      <LocaleSuggestion
        suggestedLocale="zh"
        currentLocale="en"
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    // Should show the native name "中文"
    expect(screen.getByText(/中文/)).toBeInTheDocument();
  });

  it("renders correctly for RTL locale (Arabic)", () => {
    render(
      <LocaleSuggestion
        suggestedLocale="ar"
        currentLocale="en"
        onAccept={vi.fn()}
        onDismiss={vi.fn()}
      />,
    );
    expect(screen.getByText(/العربية/)).toBeInTheDocument();
  });

  it("is non-modal — does not trap focus (Finding #23)", () => {
    render(
      <div>
        <button data-testid="outside-btn">Outside</button>
        <LocaleSuggestion
          suggestedLocale="zh"
          currentLocale="en"
          onAccept={vi.fn()}
          onDismiss={vi.fn()}
        />
      </div>,
    );
    // Can focus elements outside the suggestion
    const outsideBtn = screen.getByTestId("outside-btn");
    outsideBtn.focus();
    expect(document.activeElement).toBe(outsideBtn);
  });
});
