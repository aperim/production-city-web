import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandPalette, type CommandItem } from "./CommandPalette";

const meta = {
  title: "Molecules/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
} satisfies Meta<typeof CommandPalette>;

export default meta;

const commands: CommandItem[] = [
  { id: "new-file", label: "New file", icon: "📄", group: "File", shortcut: "Cmd+N", onSelect: () => alert("New file") },
  { id: "open", label: "Open file", icon: "📂", group: "File", shortcut: "Cmd+O", onSelect: () => alert("Open") },
  { id: "save", label: "Save", icon: "💾", group: "File", shortcut: "Cmd+S", onSelect: () => alert("Save") },
  { id: "settings", label: "Settings", icon: "⚙", description: "Open application preferences", onSelect: () => alert("Settings") },
  { id: "theme", label: "Toggle theme", icon: "◑", description: "Switch between light and dark mode", onSelect: () => alert("Theme") },
  { id: "help", label: "Help & support", icon: "?", onSelect: () => alert("Help") },
  { id: "logout", label: "Log out", icon: "→", onSelect: () => alert("Logout") },
];

function CommandPaletteDemo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div>
      <button
        className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
        onClick={() => setOpen(true)}
      >
        Open palette (or Cmd+K)
      </button>
      <CommandPalette
        items={commands}
        open={open}
        onClose={() => setOpen(false)}
        placeholder="Search commands..."
        emptyMessage="No matching commands."
      />
    </div>
  );
}

export const Default: StoryObj = {
  render: () => <CommandPaletteDemo />,
};
