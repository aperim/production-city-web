import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AttentionDot } from "./AttentionDot";

describe("AttentionDot", () => {
  it("renders red dot for urgent priority", () => {
    const { container } = render(<AttentionDot priority="urgent" />);
    expect((container.firstChild as HTMLElement)?.className).toContain("bg-red");
  });

  it("renders amber dot for action priority", () => {
    const { container } = render(<AttentionDot priority="action" />);
    expect((container.firstChild as HTMLElement)?.className).toContain("bg-amber");
  });

  it("renders blue dot for info priority", () => {
    const { container } = render(<AttentionDot priority="info" />);
    expect((container.firstChild as HTMLElement)?.className).toContain("bg-blue");
  });

  it("has accessible label", () => {
    const { container } = render(<AttentionDot priority="urgent" />);
    expect(container.querySelector(".sr-only")?.textContent).toBe("Urgent");
  });

  it("accepts custom className", () => {
    const { container } = render(<AttentionDot priority="info" className="ml-2" />);
    expect((container.firstChild as HTMLElement)?.className).toContain("ml-2");
  });
});
