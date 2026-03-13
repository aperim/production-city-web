import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress, CircularProgress } from "./Progress";

const meta = {
  title: "Molecules/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["default", "success", "warning", "error"] },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 60, "aria-label": "Upload progress" },
};

export const Indeterminate: Story = {
  args: { "aria-label": "Loading" },
};

export const Success: Story = {
  args: { value: 100, variant: "success", "aria-label": "Complete" },
};

export const Warning: Story = {
  args: { value: 75, variant: "warning", "aria-label": "Almost full" },
};

export const Error: Story = {
  args: { value: 30, variant: "error", "aria-label": "Failed" },
};

export const Small: Story = {
  args: { value: 45, size: "sm", "aria-label": "Small" },
};

export const Large: Story = {
  args: { value: 45, size: "lg", "aria-label": "Large" },
};

export const Circular: StoryObj<typeof CircularProgress> = {
  render: (args) => <CircularProgress {...args} />,
  args: { value: 65, "aria-label": "Upload", diameter: 48 },
};

export const CircularIndeterminate: StoryObj<typeof CircularProgress> = {
  render: (args) => <CircularProgress {...args} />,
  args: { "aria-label": "Loading", diameter: 40 },
};
