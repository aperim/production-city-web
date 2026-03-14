import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AcknowledgementOfCountry } from "./AcknowledgementOfCountry";

describe("AcknowledgementOfCountry", () => {
  it("renders the heading", () => {
    render(
      <AcknowledgementOfCountry
        heading="Acknowledgement of Country"
        text="We acknowledge the Traditional Owners."
      />
    );
    expect(screen.getByText("Acknowledgement of Country")).toBeInTheDocument();
  });

  it("renders the acknowledgement text", () => {
    render(
      <AcknowledgementOfCountry
        heading="Acknowledgement of Country"
        text="We acknowledge the Traditional Owners."
      />
    );
    expect(screen.getByText("We acknowledge the Traditional Owners.")).toBeInTheDocument();
  });

  it("renders a section with aria-labelledby", () => {
    render(
      <AcknowledgementOfCountry
        heading="Acknowledgement of Country"
        text="We acknowledge the Traditional Owners."
      />
    );
    const section = screen.getByRole("region");
    expect(section).toHaveAttribute("aria-labelledby");
  });

  it("merges custom className", () => {
    const { container } = render(
      <AcknowledgementOfCountry
        heading="Acknowledgement of Country"
        text="We acknowledge the Traditional Owners."
        className="custom"
      />
    );
    expect(container.firstElementChild?.getAttribute("class")).toContain("custom");
  });

  it("works in compact mode for footer", () => {
    const { container } = render(
      <AcknowledgementOfCountry
        heading="Acknowledgement of Country"
        text="We acknowledge the Traditional Owners."
        compact
      />
    );
    // Compact mode just uses smaller text
    expect(container.querySelector("p")).toBeInTheDocument();
  });
});
