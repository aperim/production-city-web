import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders with correct text", () => {
    render(<Badge>Status</Badge>);
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("applies default variant class", () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.querySelector("span");
    expect(badge?.getAttribute("class")).toContain("bg-primary");
  });

  it("applies destructive variant class", () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    const badge = container.querySelector("span");
    expect(badge?.getAttribute("class")).toContain("bg-destructive");
  });

  it("applies outline variant class", () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    const badge = container.querySelector("span");
    const classes = badge?.getAttribute("class") ?? "";
    expect(classes).not.toContain("bg-primary");
    expect(classes).toContain("text-foreground");
  });

  it("merges custom classNames", () => {
    const { container } = render(<Badge className="custom-class">Custom</Badge>);
    const badge = container.querySelector("span");
    expect(badge?.getAttribute("class")).toContain("custom-class");
  });
});
