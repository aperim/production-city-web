import type { Meta, StoryObj } from "@storybook/react-vite";
import { ButtonGroup } from "./ButtonGroup";

const meta = {
  title: "Molecules/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    variant: { control: "select", options: ["connected", "spaced"] },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const buttonStyle = "rounded-sm border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent";

export const Spaced: Story = {
  args: {
    "aria-label": "Actions",
    variant: "spaced",
    children: (
      <>
        <button className={buttonStyle}>Save</button>
        <button className={buttonStyle}>Cancel</button>
      </>
    ),
  },
};

export const Connected: Story = {
  args: {
    "aria-label": "Text formatting",
    variant: "connected",
    children: (
      <>
        <button className="border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent">Bold</button>
        <button className="border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent">Italic</button>
        <button className="border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent">Underline</button>
      </>
    ),
  },
};

export const Vertical: Story = {
  args: {
    "aria-label": "Sort options",
    orientation: "vertical",
    children: (
      <>
        <button className={buttonStyle}>Name</button>
        <button className={buttonStyle}>Date</button>
        <button className={buttonStyle}>Size</button>
      </>
    ),
  },
};
