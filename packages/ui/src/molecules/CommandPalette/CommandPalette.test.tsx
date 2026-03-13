import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CommandPalette, type CommandItem } from "./CommandPalette";

const items: CommandItem[] = [
  { id: "new", label: "New file", group: "File", onSelect: vi.fn() },
  { id: "open", label: "Open file", group: "File", shortcut: "Cmd+O", onSelect: vi.fn() },
  { id: "settings", label: "Settings", description: "Open app settings", onSelect: vi.fn() },
  { id: "logout", label: "Log out", onSelect: vi.fn() },
];

describe("CommandPalette", () => {
  it("renders nothing when closed", () => {
    render(<CommandPalette items={items} open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(<CommandPalette items={items} open={true} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<CommandPalette items={items} open={true} onClose={() => {}} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows all items by default", () => {
    render(<CommandPalette items={items} open={true} onClose={() => {}} />);
    expect(screen.getByText("New file")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("filters items by search query", async () => {
    render(<CommandPalette items={items} open={true} onClose={() => {}} />);
    await userEvent.type(screen.getByRole("combobox"), "set");
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.queryByText("New file")).not.toBeInTheDocument();
  });

  it("shows empty state when no results", async () => {
    render(
      <CommandPalette
        items={items}
        open={true}
        onClose={() => {}}
        emptyMessage="No results found"
      />,
    );
    await userEvent.type(screen.getByRole("combobox"), "xyzabc");
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("calls onClose when Escape is pressed", async () => {
    const handleClose = vi.fn();
    render(<CommandPalette items={items} open={true} onClose={handleClose} />);
    await userEvent.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when close button clicked", async () => {
    const handleClose = vi.fn();
    render(<CommandPalette items={items} open={true} onClose={handleClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Close command palette" }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("calls item onSelect when clicked", async () => {
    const handleSelect = vi.fn();
    const testItems: CommandItem[] = [
      { id: "act", label: "Do action", onSelect: handleSelect },
    ];
    const handleClose = vi.fn();
    render(<CommandPalette items={testItems} open={true} onClose={handleClose} />);
    await userEvent.click(screen.getByText("Do action"));
    expect(handleSelect).toHaveBeenCalledOnce();
    expect(handleClose).toHaveBeenCalled();
  });

  it("renders keyboard shortcut", () => {
    render(<CommandPalette items={items} open={true} onClose={() => {}} />);
    expect(screen.getByText("Cmd+O")).toBeInTheDocument();
  });

  it("renders group labels", () => {
    render(<CommandPalette items={items} open={true} onClose={() => {}} />);
    expect(screen.getByText("File")).toBeInTheDocument();
  });

  it("navigates with arrow keys and selects with Enter", async () => {
    const handleSelect = vi.fn();
    const testItems: CommandItem[] = [
      { id: "a", label: "Alpha", onSelect: handleSelect },
      { id: "b", label: "Beta", onSelect: handleSelect },
    ];
    const handleClose = vi.fn();
    render(<CommandPalette items={testItems} open={true} onClose={handleClose} />);
    const input = screen.getByRole("combobox");
    input.focus();
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    expect(handleSelect).toHaveBeenCalled();
  });

  it("has aria-modal=true on dialog", () => {
    render(<CommandPalette items={items} open={true} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });
});
