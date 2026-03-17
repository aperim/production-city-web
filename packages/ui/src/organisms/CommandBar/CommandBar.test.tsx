/**
 * Tests for CommandBar organism — dashboard-specific command palette.
 * @see Issue #342
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandBar, type CommandBarProps, type CommandBarObjectResult } from "./CommandBar";

const sampleFeatures = [
  {
    id: "home.overview.executive",
    label: "Executive Dashboard",
    description: "Company-wide KPIs",
    path: "/dashboard/home/executive",
    section: "Dashboard",
    subsection: "Overview",
    keywords: ["kpi", "metrics"],
    status: "planned" as const,
  },
  {
    id: "company_ops.hr.directory",
    label: "Team Directory",
    description: "Employee directory with profiles",
    path: "/dashboard/company/hr/directory",
    section: "Company Operations",
    subsection: "Human Resources",
    keywords: ["employee", "staff", "people"],
    status: "coming_soon" as const,
  },
  {
    id: "administration.users.management",
    label: "User Management",
    description: "Manage users and roles",
    path: "/dashboard/admin/users/management",
    section: "Administration",
    subsection: "Users",
    keywords: ["admin", "roles"],
    status: "active" as const,
  },
];

function renderCommandBar(overrides?: Partial<CommandBarProps>) {
  const defaultProps: CommandBarProps = {
    featureIndex: sampleFeatures,
    recentFeatureIds: [],
    onSelect: vi.fn(),
    onClose: vi.fn(),
    open: true,
    ...overrides,
  };
  return { ...render(<CommandBar {...defaultProps} />), props: defaultProps };
}

describe("CommandBar", () => {
  it("renders as a dialog when open", () => {
    renderCommandBar();
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("does not render when closed", () => {
    renderCommandBar({ open: false });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows all features when no query", () => {
    renderCommandBar();
    expect(screen.getByText("Executive Dashboard")).toBeDefined();
    expect(screen.getByText("Team Directory")).toBeDefined();
    expect(screen.getByText("User Management")).toBeDefined();
  });

  it("filters features by search query", async () => {
    const user = userEvent.setup();
    renderCommandBar();
    const input = screen.getByRole("combobox");
    await user.type(input, "directory");
    expect(screen.getByText("Team Directory")).toBeDefined();
    expect(screen.queryByText("Executive Dashboard")).toBeNull();
  });

  it("searches by keywords", async () => {
    const user = userEvent.setup();
    renderCommandBar();
    const input = screen.getByRole("combobox");
    await user.type(input, "kpi");
    expect(screen.getByText("Executive Dashboard")).toBeDefined();
    expect(screen.queryByText("Team Directory")).toBeNull();
  });

  it("shows status badges for results", () => {
    renderCommandBar();
    // Status text should appear as badges
    expect(screen.getByText("Planned")).toBeDefined();
    expect(screen.getByText("Coming Soon")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
  });

  it("shows empty state when no results", async () => {
    const user = userEvent.setup();
    renderCommandBar();
    const input = screen.getByRole("combobox");
    await user.type(input, "xyznonexistent");
    // The text appears in both the list and the sr-only region
    expect(screen.getAllByText(/no features found/i).length).toBeGreaterThanOrEqual(1);
  });

  it("calls onSelect with featureId and path on Enter", async () => {
    const user = userEvent.setup();
    const { props } = renderCommandBar();
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(props.onSelect).toHaveBeenCalledWith(
      "home.overview.executive",
      "/dashboard/home/executive",
    );
  });

  it("calls onClose on Escape", async () => {
    const user = userEvent.setup();
    const { props } = renderCommandBar();
    // Focus the input first (simulating user interaction)
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{Escape}");
    expect(props.onClose).toHaveBeenCalled();
  });

  it("navigates with arrow keys", async () => {
    const user = userEvent.setup();
    const { props } = renderCommandBar();
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(props.onSelect).toHaveBeenCalledWith(
      "company_ops.hr.directory",
      "/dashboard/company/hr/directory",
    );
  });

  it("shows recent features section when provided", () => {
    renderCommandBar({
      recentFeatureIds: ["administration.users.management"],
    });
    expect(screen.getByText("Recent")).toBeDefined();
  });

  it("has ARIA combobox pattern", () => {
    renderCommandBar();
    const input = screen.getByRole("combobox");
    expect(input.getAttribute("aria-expanded")).toBeDefined();
    expect(input.getAttribute("aria-controls")).toBeDefined();
  });

  it("shows section path as breadcrumb context", () => {
    renderCommandBar();
    // Should show section/subsection context
    expect(screen.getByText(/Company Operations/)).toBeDefined();
  });
});

describe("CommandBar — object search extension", () => {
  const objectResults: CommandBarObjectResult[] = [
    { type: "user", id: "u1", title: "Jane Smith", subtitle: "Production Manager", workspace: "people", url: "/dashboard/people/directory" },
    { type: "facility", id: "f1", title: "Sound Stage 3", subtitle: "Available", workspace: "facilities", url: "/dashboard/facilities/sound-stages" },
  ];

  it("renders object results above feature results", () => {
    renderCommandBar({
      objectResults,
    });
    // Object results should appear in the list
    expect(screen.getByText("Jane Smith")).toBeDefined();
    expect(screen.getByText("Sound Stage 3")).toBeDefined();
  });

  it("groups object results by workspace", () => {
    renderCommandBar({
      featureIndex: [],
      objectResults,
    });
    // Workspace group headers
    expect(screen.getByText("People")).toBeDefined();
    expect(screen.getByText("Facilities")).toBeDefined();
  });

  it("calls onObjectSearch with debounced query", async () => {
    vi.useFakeTimers();
    const onObjectSearch = vi.fn();
    renderCommandBar({
      featureIndex: [],
      objectResults: [],
      onObjectSearch,
    });
    const input = screen.getByRole("combobox");

    // Type a query — onObjectSearch should NOT be called immediately
    fireEvent.change(input, { target: { value: "stage" } });
    expect(onObjectSearch).not.toHaveBeenCalled();

    // Advance timers past the 300ms debounce window
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Now onObjectSearch should have been called with the query
    expect(onObjectSearch).toHaveBeenCalledTimes(1);
    expect(onObjectSearch).toHaveBeenCalledWith("stage");

    // Typing again should reset the debounce
    fireEvent.change(input, { target: { value: "stage 3" } });
    act(() => {
      vi.advanceTimersByTime(100); // Only 100ms — not enough
    });
    expect(onObjectSearch).toHaveBeenCalledTimes(1); // Still just the first call

    act(() => {
      vi.advanceTimersByTime(250); // Now 350ms total since last keystroke
    });
    expect(onObjectSearch).toHaveBeenCalledTimes(2);
    expect(onObjectSearch).toHaveBeenLastCalledWith("stage 3");

    vi.useRealTimers();
  });

  it("selects object result on Enter", async () => {
    const user = userEvent.setup();
    const { props } = renderCommandBar({
      featureIndex: [],
      objectResults: [objectResults[0]!],
    });
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(props.onSelect).toHaveBeenCalledWith("u1", "/dashboard/people/directory");
  });
});
