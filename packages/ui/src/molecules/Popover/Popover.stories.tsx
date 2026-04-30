import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "./Popover";

const meta = {
  title: "Molecules/Popover",
  component: Popover,
  tags: ["autodocs"],
  argTypes: {
    position: { control: "select", options: ["top", "bottom", "left", "right"] },
    showClose: { control: "boolean" },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const triggerButton = (
  <button className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent">
    Show details
  </button>
);

export const Default: Story = {
  args: {
    trigger: triggerButton,
    content: (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">More information</p>
        <p className="text-sm text-muted-foreground">Additional context for this feature.</p>
      </div>
    ),
    "aria-label": "Feature details",
  },
};

export const WithCloseButton: Story = {
  args: {
    trigger: triggerButton,
    showClose: true,
    content: (
      <div className="flex flex-col gap-2 pe-4">
        <p className="text-sm font-medium">Dismissible popover</p>
        <p className="text-sm text-muted-foreground">Click the X or press Escape to close.</p>
      </div>
    ),
  },
};

export const TopPosition: Story = {
  args: {
    trigger: triggerButton,
    position: "top",
    content: <p className="text-sm">I appear above the trigger.</p>,
  },
};

export const WithActions: Story = {
  args: {
    trigger: triggerButton,
    showClose: true,
    content: (
      <div className="flex flex-col gap-3">
        <p className="text-sm">Confirm this action?</p>
        <div className="flex gap-2">
          <button className="rounded-sm bg-destructive px-3 py-1.5 text-xs text-white">Delete</button>
          <button className="rounded-sm border border-border px-3 py-1.5 text-xs">Cancel</button>
        </div>
      </div>
    ),
    "aria-label": "Confirm deletion",
  },
};

/** Tab to the trigger to see the focus ring. Click interaction does not show a ring. */
export const FocusVisible: Story = {
  args: {
    trigger: triggerButton,
    content: <p className="text-sm">Tab here to verify focus indicator.</p>,
  },
};
