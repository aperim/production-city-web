import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./Select";

const fruits = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Cherry", value: "cherry" },
];

const grouped = [
  {
    label: "Citrus",
    options: [
      { label: "Lemon", value: "lemon" },
      { label: "Orange", value: "orange" },
    ],
  },
  {
    label: "Berries",
    options: [
      { label: "Blueberry", value: "blueberry" },
      { label: "Strawberry", value: "strawberry" },
    ],
  },
];

const meta = {
  title: "Atoms/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Fruit", options: fruits },
};

export const WithPlaceholder: Story = {
  args: { label: "Fruit", options: fruits, placeholder: "Select a fruit" },
};

export const WithHelperText: Story = {
  args: { label: "Fruit", options: fruits, helperText: "Choose your favourite fruit" },
};

export const WithError: Story = {
  args: { label: "Fruit", options: fruits, errorMessage: "Please select a fruit" },
};

export const Grouped: Story = {
  args: { label: "Fruit", options: grouped, placeholder: "Select..." },
};

export const Disabled: Story = {
  args: { label: "Fruit", options: fruits, disabled: true },
};

export const Small: Story = {
  args: { label: "Fruit", options: fruits, size: "sm" },
};

export const Large: Story = {
  args: { label: "Fruit", options: fruits, size: "lg" },
};
