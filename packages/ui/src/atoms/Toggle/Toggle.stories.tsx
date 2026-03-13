import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toggle } from "./Toggle";

const meta = {
  title: "Atoms/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Enable feature" },
};

export const On: Story = {
  args: { label: "Dark mode", defaultChecked: true },
};

export const WithDescription: Story = {
  args: {
    label: "Marketing emails",
    description: "Receive updates about new products and features",
  },
};

export const Disabled: Story = {
  args: { label: "Disabled feature", disabled: true },
};

export const DisabledOn: Story = {
  args: { label: "Locked on", disabled: true, defaultChecked: true },
};

export const Small: Story = {
  args: { label: "Small toggle", size: "sm" },
};

export const Large: Story = {
  args: { label: "Large toggle", size: "lg" },
};
