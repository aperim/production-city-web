import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField } from "./FormField";

const meta = {
  title: "Molecules/FormField",
  component: FormField,
  tags: ["autodocs"],
  argTypes: {
    required: { control: "boolean" },
    optional: { control: "boolean" },
    inline: { control: "boolean" },
  },
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email address",
    children: <input id="email" type="email" className="w-full rounded-sm border border-border px-3 py-1.5 text-sm" />,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Username",
    helperText: "Must be 3–20 characters, letters and numbers only.",
    children: <input id="username" type="text" className="w-full rounded-sm border border-border px-3 py-1.5 text-sm" />,
  },
};

export const WithError: Story = {
  args: {
    label: "Email address",
    errorMessage: "Please enter a valid email address.",
    children: <input id="email-err" type="email" className="w-full rounded-sm border border-destructive px-3 py-1.5 text-sm" />,
  },
};

export const Required: Story = {
  args: {
    label: "Full name",
    required: true,
    children: <input id="fullname" type="text" className="w-full rounded-sm border border-border px-3 py-1.5 text-sm" />,
  },
};

export const Optional: Story = {
  args: {
    label: "Phone number",
    optional: true,
    children: <input id="phone" type="tel" className="w-full rounded-sm border border-border px-3 py-1.5 text-sm" />,
  },
};

export const Inline: Story = {
  args: {
    label: "Notifications",
    inline: true,
    children: <input id="notif" type="checkbox" className="h-4 w-4" />,
  },
};

export const WithCharacterCount: Story = {
  args: {
    label: "Bio",
    characterCount: "45 / 200",
    children: <textarea id="bio" className="w-full rounded-sm border border-border px-3 py-1.5 text-sm" />,
  },
};
