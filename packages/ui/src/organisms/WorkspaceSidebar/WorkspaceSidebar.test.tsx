import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkspaceSidebar } from "./WorkspaceSidebar";

const workspaces = [
  { id: "productions", label: "Productions", icon: "film", path: "/dashboard/productions" },
  { id: "finance", label: "Finance", icon: "dollar-sign", path: "/dashboard/finance" },
  { id: "facilities", label: "Facilities", icon: "building", path: "/dashboard/facilities" },
];

describe("WorkspaceSidebar", () => {
  it("renders navigation landmark", () => {
    render(<WorkspaceSidebar workspaces={workspaces} />);
    expect(screen.getByRole("navigation")).toBeDefined();
  });

  it("renders all workspace items", () => {
    render(<WorkspaceSidebar workspaces={workspaces} />);
    expect(screen.getByText("Productions")).toBeDefined();
    expect(screen.getByText("Finance")).toBeDefined();
    expect(screen.getByText("Facilities")).toBeDefined();
  });

  it("renders Home and Inbox", () => {
    render(<WorkspaceSidebar workspaces={workspaces} />);
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Inbox")).toBeDefined();
  });

  it("renders inbox badge when count > 0", () => {
    render(<WorkspaceSidebar workspaces={workspaces} inboxCount={5} />);
    expect(screen.getByText("5")).toBeDefined();
  });

  it("does not render inbox badge when count is 0", () => {
    render(<WorkspaceSidebar workspaces={workspaces} inboxCount={0} />);
    expect(screen.queryByLabelText(/unread/)).toBeNull();
  });

  it("calls onNavigate when workspace clicked", () => {
    const onNavigate = vi.fn();
    render(<WorkspaceSidebar workspaces={workspaces} onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText("Productions"));
    expect(onNavigate).toHaveBeenCalledWith("/dashboard/productions");
  });

  it("calls onToggleCollapse when collapse button clicked", () => {
    const onToggle = vi.fn();
    render(<WorkspaceSidebar workspaces={workspaces} onToggleCollapse={onToggle} />);
    fireEvent.click(screen.getByLabelText("Collapse sidebar"));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("hides labels when collapsed", () => {
    render(<WorkspaceSidebar workspaces={workspaces} collapsed />);
    expect(screen.queryByText("Productions")).toBeNull();
    expect(screen.queryByText("Home")).toBeNull();
  });

  it("shows expand label when collapsed", () => {
    render(<WorkspaceSidebar workspaces={workspaces} collapsed />);
    expect(screen.getByLabelText("Expand sidebar")).toBeDefined();
  });

  it("renders recent items when provided", () => {
    const recents = [
      { label: "Shooting — Productions", path: "/dashboard/productions/shooting", timestamp: new Date().toISOString() },
    ];
    render(<WorkspaceSidebar workspaces={workspaces} recents={recents} />);
    expect(screen.getByText("Shooting — Productions")).toBeDefined();
  });

  it("highlights active workspace", () => {
    render(
      <WorkspaceSidebar workspaces={workspaces} activeWorkspace="finance" />,
    );
    const financeBtn = screen.getByText("Finance").closest("button");
    expect(financeBtn?.className).toContain("bg-accent");
  });

  it("renders Profile and Help links", () => {
    render(<WorkspaceSidebar workspaces={workspaces} />);
    expect(screen.getByText("Profile")).toBeDefined();
    expect(screen.getByText("Help")).toBeDefined();
  });
});
