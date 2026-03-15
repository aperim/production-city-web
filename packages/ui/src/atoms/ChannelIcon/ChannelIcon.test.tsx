import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChannelIcon } from "./ChannelIcon";

describe("ChannelIcon", () => {
  it("renders email icon with accessible label", () => {
    render(<ChannelIcon channel="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders sms icon with accessible label", () => {
    render(<ChannelIcon channel="sms" />);
    expect(screen.getByLabelText("SMS")).toBeInTheDocument();
  });

  it("applies small size class", () => {
    const { container } = render(<ChannelIcon channel="email" size="sm" />);
    const svg = container.querySelector("svg");
    expect(svg?.className.baseVal).toContain("h-4");
  });

  it("applies large size class", () => {
    const { container } = render(<ChannelIcon channel="email" size="lg" />);
    const svg = container.querySelector("svg");
    expect(svg?.className.baseVal).toContain("h-6");
  });

  it("defaults to medium size", () => {
    const { container } = render(<ChannelIcon channel="email" />);
    const svg = container.querySelector("svg");
    expect(svg?.className.baseVal).toContain("h-5");
  });
});
