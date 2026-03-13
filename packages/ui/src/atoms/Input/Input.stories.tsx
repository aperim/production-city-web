import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    type: { control: "select", options: ["text", "email", "password", "number", "search"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    error: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Name", placeholder: "Enter your name" },
};

export const WithHelperText: Story = {
  args: { label: "Email", type: "email", helperText: "We never share your email", placeholder: "you@example.com" },
};

export const WithError: Story = {
  args: { label: "Email", type: "email", errorMessage: "Please enter a valid email", placeholder: "you@example.com" },
};

export const Disabled: Story = {
  args: { label: "Name", disabled: true, defaultValue: "John Doe" },
};

export const ReadOnly: Story = {
  args: { label: "Username", readOnly: true, defaultValue: "johndoe" },
};

export const Password: Story = {
  args: { label: "Password", type: "password", placeholder: "Enter password" },
};

export const Search: Story = {
  args: { label: "Search", type: "search", placeholder: "Search..." },
};

export const Small: Story = {
  args: { label: "Name", size: "sm", placeholder: "Small input" },
};

export const Large: Story = {
  args: { label: "Name", size: "lg", placeholder: "Large input" },
};

export const WithIcons: Story = {
  args: {
    label: "Search",
    leftIcon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    placeholder: "Search...",
  },
};
