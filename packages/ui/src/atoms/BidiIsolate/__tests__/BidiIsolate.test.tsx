import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BidiIsolate } from "../BidiIsolate";

describe("BidiIsolate", () => {
  it("renders a <bdi> element wrapping children", () => {
    render(<BidiIsolate>Hello</BidiIsolate>);
    const bdi = screen.getByText("Hello");
    expect(bdi.tagName).toBe("BDI");
  });

  it("applies dir attribute when specified", () => {
    render(<BidiIsolate dir="ltr">+1-555-0100</BidiIsolate>);
    const bdi = screen.getByText("+1-555-0100");
    expect(bdi).toHaveAttribute("dir", "ltr");
  });

  it('defaults to dir="auto" when no dir prop', () => {
    render(<BidiIsolate>Content</BidiIsolate>);
    const bdi = screen.getByText("Content");
    expect(bdi).toHaveAttribute("dir", "auto");
  });

  it("renders inline (does not disrupt layout)", () => {
    const { container } = render(
      <p>
        Text before <BidiIsolate>inline content</BidiIsolate> text after
      </p>,
    );
    // bdi is naturally inline, so it should not create a block
    const bdi = container.querySelector("bdi");
    expect(bdi).toBeTruthy();
    // Verify it's within the paragraph
    expect(bdi!.parentElement?.tagName).toBe("P");
  });

  it("passes through className if provided", () => {
    render(<BidiIsolate className="custom-class">Text</BidiIsolate>);
    const bdi = screen.getByText("Text");
    expect(bdi).toHaveClass("custom-class");
  });

  it("renders nested BidiIsolate correctly (Finding #22)", () => {
    render(
      <BidiIsolate dir="rtl">
        <BidiIsolate dir="ltr">Nested LTR</BidiIsolate>
      </BidiIsolate>,
    );
    const inner = screen.getByText("Nested LTR");
    expect(inner.tagName).toBe("BDI");
    expect(inner).toHaveAttribute("dir", "ltr");
    // Outer bdi wraps the inner one
    expect(inner.parentElement?.tagName).toBe("BDI");
    expect(inner.parentElement).toHaveAttribute("dir", "rtl");
  });

  it("renders empty children without error (Finding #22)", () => {
    const { container } = render(<BidiIsolate>{""}</BidiIsolate>);
    const bdi = container.querySelector("bdi");
    expect(bdi).toBeTruthy();
  });

  it("handles very long LTR string without breaking (Finding #22)", () => {
    const longString = "A".repeat(5000);
    render(<BidiIsolate>{longString}</BidiIsolate>);
    const bdi = screen.getByText(longString);
    expect(bdi.tagName).toBe("BDI");
  });
});
