import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlateImage } from "./PlateImage";

describe("PlateImage", () => {
  it("renders with role=img", () => {
    render(<PlateImage />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("uses center label as accessible aria-label", () => {
    render(<PlateImage centerLabel="[ Stage Interior ]" />);
    expect(screen.getByRole("img", { name: "[ Stage Interior ]" })).toBeInTheDocument();
  });

  it("renders corner label top-left", () => {
    render(<PlateImage cornerLabel="A · Screen Sound Stage" />);
    expect(screen.getByText("A · Screen Sound Stage")).toBeInTheDocument();
  });

  it("renders corner label top-right", () => {
    render(<PlateImage cornerLabelRight="2,025 m²" />);
    expect(screen.getByText("2,025 m²")).toBeInTheDocument();
  });

  it("renders both bottom items", () => {
    render(<PlateImage bottomItems={["45 × 45 m", "H 15 m"]} />);
    expect(screen.getByText("45 × 45 m")).toBeInTheDocument();
    expect(screen.getByText("H 15 m")).toBeInTheDocument();
  });

  it("applies accentBorder style for First Nations use", () => {
    const { container } = render(<PlateImage accentBorder="var(--ochre)" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.borderLeft).toContain("var(--ochre)");
  });

  it("applies paper variant styling", () => {
    const { container } = render(<PlateImage paper />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.background).toContain("#EFEBE0");
  });

  it("defaults to 16/9 aspect ratio", () => {
    const { container } = render(<PlateImage />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.aspectRatio).toBe("16/9");
  });

  it("applies given aspect ratio", () => {
    const { container } = render(<PlateImage aspect="3/4" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.aspectRatio).toBe("3/4");
  });

  it("falls back aria-label to 'Image placeholder' when no centerLabel", () => {
    render(<PlateImage cornerLabel="Stage A" />);
    expect(screen.getByRole("img", { name: "Image placeholder" })).toBeInTheDocument();
  });
});
