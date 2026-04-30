import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dropdown } from "./Dropdown";

const meta = {
  title: "Molecules/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  argTypes: {
    align: { control: "select", options: ["start", "end"] },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const triggerButton = (
  <button className="rounded-sm border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent">
    Options ▾
  </button>
);

export const Default: Story = {
  args: {
    trigger: triggerButton,
    items: [
      { id: "edit", label: "Edit" },
      { id: "duplicate", label: "Duplicate" },
      { id: "delete", label: "Delete", separator: true },
    ],
    "aria-label": "Item actions",
  },
};

export const WithIcons: Story = {
  args: {
    trigger: triggerButton,
    items: [
      { id: "edit", label: "Edit", icon: "✏" },
      { id: "copy", label: "Copy", icon: "⧉" },
      { id: "delete", label: "Delete", icon: "🗑", separator: true },
    ],
  },
};

export const WithDisabled: Story = {
  args: {
    trigger: triggerButton,
    items: [
      { id: "view", label: "View" },
      { id: "edit", label: "Edit" },
      { id: "delete", label: "Delete (locked)", disabled: true },
    ],
  },
};

export const WithCheckmarks: Story = {
  args: {
    trigger: triggerButton,
    items: [
      { id: "dark", label: "Dark mode", checked: true },
      { id: "notifications", label: "Notifications", checked: false },
      { id: "compact", label: "Compact view", checked: false },
    ],
  },
};

/** Tab to the trigger to see the focus ring on the trigger. Open the menu and tab through items to see focus indicators. */
export const FocusVisible: Story = {
  args: {
    trigger: triggerButton,
    items: [
      { id: "edit", label: "Edit" },
      { id: "duplicate", label: "Duplicate" },
      { id: "delete", label: "Delete", separator: true },
    ],
  },
};
