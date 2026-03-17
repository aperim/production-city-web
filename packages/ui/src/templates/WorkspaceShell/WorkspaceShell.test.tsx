import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WorkspaceShell } from "./WorkspaceShell";

describe("WorkspaceShell", () => {
  it("renders sidebar slot", () => {
    render(
      <WorkspaceShell sidebar={<nav data-testid="sidebar">Sidebar</nav>}>
        <div>Content</div>
      </WorkspaceShell>,
    );
    expect(screen.getByTestId("sidebar")).toBeDefined();
  });

  it("renders main content", () => {
    render(
      <WorkspaceShell sidebar={<nav>Sidebar</nav>}>
        <div>Main content</div>
      </WorkspaceShell>,
    );
    expect(screen.getByText("Main content")).toBeDefined();
  });

  it("renders tabs slot when provided", () => {
    render(
      <WorkspaceShell sidebar={<nav>Sidebar</nav>} tabs={<div data-testid="tabs">Tabs</div>}>
        <div>Content</div>
      </WorkspaceShell>,
    );
    expect(screen.getByTestId("tabs")).toBeDefined();
  });

  it("renders scope bar slot when provided", () => {
    render(
      <WorkspaceShell sidebar={<nav>Sidebar</nav>} scopeBar={<div data-testid="scope">Scope</div>}>
        <div>Content</div>
      </WorkspaceShell>,
    );
    expect(screen.getByTestId("scope")).toBeDefined();
  });

  it("renders AI panel slot when provided", () => {
    render(
      <WorkspaceShell sidebar={<nav>Sidebar</nav>} aiPanel={<div data-testid="ai">AI</div>}>
        <div>Content</div>
      </WorkspaceShell>,
    );
    expect(screen.getByTestId("ai")).toBeDefined();
  });

  it("has skip-to-content link", () => {
    render(
      <WorkspaceShell sidebar={<nav>Sidebar</nav>}>
        <div>Content</div>
      </WorkspaceShell>,
    );
    expect(screen.getByText("Skip to main content")).toBeDefined();
  });

  it("main content has id for skip link", () => {
    render(
      <WorkspaceShell sidebar={<nav>Sidebar</nav>}>
        <div>Content</div>
      </WorkspaceShell>,
    );
    const main = document.getElementById("workspace-content");
    expect(main).not.toBeNull();
    expect(main?.tagName).toBe("MAIN");
  });
});
