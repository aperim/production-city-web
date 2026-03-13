import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamMember } from "./TeamMember";

describe("TeamMember", () => {
  it("renders name", () => {
    render(<TeamMember name="Jane Doe" role="Director" />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders role", () => {
    render(<TeamMember name="Jane Doe" role="Director" />);
    expect(screen.getByText("Director")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<TeamMember name="Jane Doe" role="Director" description="20 years experience" />);
    expect(screen.getByText("20 years experience")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<TeamMember name="Test" role="Role" className="custom" />);
    expect(container.firstElementChild?.getAttribute("class")).toContain("custom");
  });

  it("does not render decorative avatar borders", () => {
    const { container } = render(<TeamMember name="Test" role="Role" />);
    const classes = container.innerHTML;
    expect(classes).not.toContain("ring-");
    expect(classes).not.toContain("border-2");
  });
});
