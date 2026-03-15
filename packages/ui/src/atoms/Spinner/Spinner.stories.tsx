import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./Spinner";

const meta = {
  title: "Atoms/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    label: { control: "text" },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: { size: "sm" },
};

export const Medium: Story = {
  args: { size: "md" },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const InButton: StoryObj = {
  render: () => (
    <button
      disabled
      className="inline-flex items-center gap-2 rounded-sm bg-primary text-primary-foreground px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed"
    >
      <Spinner size="sm" label="Submitting" />
      Sending...
    </button>
  ),
};
