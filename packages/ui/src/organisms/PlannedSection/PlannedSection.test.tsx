import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlannedSection, type PlannedSectionProps } from "./PlannedSection";

const features = Array.from({ length: 8 }, (_, i) => ({
  featureId: `feat.${i}`,
  label: `Feature ${i + 1}`,
  description: `Description for feature ${i + 1}`,
  status: i < 4 ? "coming_soon" as const : "planned" as const,
  targetQuarter: i < 4 ? "Q3 2026" : null,
  onNotify: vi.fn(),
}));

const defaultProps: PlannedSectionProps = {
  workspaceId: "productions",
  features,
};

const store: Record<string, string> = {};
const mockStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const k of Object.keys(store)) delete store[k]; }),
  length: 0,
  key: vi.fn(() => null),
};

describe("PlannedSection", () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    vi.stubGlobal("localStorage", mockStorage);
  });

  it("renders collapsed by default with feature count", () => {
    render(<PlannedSection {...defaultProps} />);
    expect(screen.getByText(/8 planned features/)).toBeDefined();
  });

  it("expands on click to show features", () => {
    render(<PlannedSection {...defaultProps} />);
    fireEvent.click(screen.getByText(/8 planned features/));
    expect(screen.getByText("Feature 1")).toBeDefined();
  });

  it("shows +N more when >6 features", () => {
    render(<PlannedSection {...defaultProps} />);
    fireEvent.click(screen.getByText(/8 planned features/));
    expect(screen.getByText(/\+2 more/)).toBeDefined();
  });

  it("renders nothing when no features", () => {
    const { container } = render(<PlannedSection workspaceId="empty" features={[]} />);
    expect(container.textContent).toBe("");
  });

  it("persists collapse state to localStorage", () => {
    render(<PlannedSection {...defaultProps} />);
    fireEvent.click(screen.getByText(/8 planned features/));
    const stored = localStorage.getItem("pc-planned-expanded-productions");
    expect(stored).toBe("true");
  });
});
