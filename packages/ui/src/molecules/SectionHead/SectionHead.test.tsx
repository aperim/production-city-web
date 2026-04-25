import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHead } from "./SectionHead";

describe("SectionHead", () => {
  it("renders heading as h2", () => {
    render(<SectionHead label="01 — Intro" heading="The heading." />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("The heading.");
  });

  it("renders label text", () => {
    render(<SectionHead label="01 — Operating model" heading="X" />);
    expect(screen.getByText("01 — Operating model")).toBeInTheDocument();
  });

  it("renders lead when provided", () => {
    render(<SectionHead label="01" heading="X" lead="This is the lead." />);
    expect(screen.getByText("This is the lead.")).toBeInTheDocument();
  });

  it("does not render lead when omitted", () => {
    const { container } = render(<SectionHead label="01" heading="X" />);
    expect(container.querySelector("p")).toBeNull();
  });

  it("renders children when provided", () => {
    render(
      <SectionHead label="01" heading="X">
        <a href="/more">Read more</a>
      </SectionHead>,
    );
    expect(screen.getByRole("link", { name: "Read more" })).toBeInTheDocument();
  });
});
