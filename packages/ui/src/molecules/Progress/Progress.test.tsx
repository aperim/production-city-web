import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress, CircularProgress } from "./Progress";

describe("Progress (linear)", () => {
  it("renders progressbar role", () => {
    render(<Progress value={50} aria-label="Upload" />);
    expect(screen.getByRole("progressbar", { name: "Upload" })).toBeInTheDocument();
  });

  it("sets aria-valuenow", () => {
    render(<Progress value={75} aria-label="Progress" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
  });

  it("sets aria-valuemin and aria-valuemax", () => {
    render(<Progress value={50} aria-label="Progress" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("uses custom max", () => {
    render(<Progress value={25} max={50} aria-label="Progress" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "50");
  });

  it("is indeterminate when value is undefined", () => {
    render(<Progress aria-label="Loading" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("aria-busy", "true");
  });

  it("clamps value to 0–max range", () => {
    render(<Progress value={150} aria-label="Clamped" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("applies size variant", () => {
    const { container } = render(<Progress value={50} size="lg" aria-label="lg" />);
    expect(container.firstChild).toHaveClass("h-4");
  });
});

describe("CircularProgress", () => {
  it("renders progressbar role", () => {
    render(<CircularProgress value={60} aria-label="Upload" />);
    expect(screen.getByRole("progressbar", { name: "Upload" })).toBeInTheDocument();
  });

  it("sets aria-valuenow", () => {
    render(<CircularProgress value={40} aria-label="Circular" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
  });

  it("is indeterminate when value is undefined", () => {
    render(<CircularProgress aria-label="Spinning" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("aria-busy", "true");
  });

  it("renders SVG element", () => {
    const { container } = render(<CircularProgress value={50} aria-label="SVG" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
