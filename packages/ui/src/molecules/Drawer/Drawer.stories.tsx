import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Drawer, type DrawerPosition } from "./Drawer";

const meta = {
  title: "Molecules/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  argTypes: {
    position: { control: "select", options: ["left", "right", "bottom"] },
    showClose: { control: "boolean" },
    open: { control: "boolean" },
  },
} satisfies Meta<typeof Drawer>;

export default meta;

function DrawerDemo({ position }: { position?: DrawerPosition }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
        onClick={() => setOpen(true)}
      >
        Open {position ?? "right"} drawer
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        position={position ?? "right"}
        title="Drawer title"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Drawer panel content.</p>
          <input
            type="text"
            placeholder="Focusable input"
            className="w-full rounded-sm border border-border px-3 py-1.5 text-sm"
          />
          <button
            className="rounded-sm bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            onClick={() => setOpen(false)}
          >
            Apply
          </button>
        </div>
      </Drawer>
    </div>
  );
}

export const Right: StoryObj = { render: () => <DrawerDemo position="right" /> };
export const Left: StoryObj = { render: () => <DrawerDemo position="left" /> };
export const Bottom: StoryObj = { render: () => <DrawerDemo position="bottom" /> };
