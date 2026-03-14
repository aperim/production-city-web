import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandAccentDivider } from "./BrandAccentDivider";

describe("BrandAccentDivider", () => {
  it("renders a divider element", () => {
    const { container } = render(<BrandAccentDivider />);
    const divider = container.querySelector("hr, [role='separator']");
    expect(divider).toBeInTheDocument();
  });

  it("renders primary variant", () => {
    const { container } = render(<BrandAccentDivider variant="primary" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/primary/);
  });

  it("renders secondary variant", () => {
    const { container } = render(<BrandAccentDivider variant="secondary" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/secondary/);
  });

  it("renders gradient variant", () => {
    const { container } = render(<BrandAccentDivider variant="gradient" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className + (el.getAttribute("style") ?? "")).toMatch(
      /gradient/,
    );
  });

  it("renders centered width variant", () => {
    const { container } = render(
      <BrandAccentDivider width="centered" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/mx-auto|centered/);
  });

  it("renders full width by default", () => {
    const { container } = render(<BrandAccentDivider />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/w-full|full/);
  });
});
