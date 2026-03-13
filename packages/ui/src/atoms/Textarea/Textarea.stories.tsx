import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta = {
  title: "Atoms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    autoResize: { control: "boolean" },
    maxLength: { control: "number" },
    minRows: { control: "number" },
    maxRows: { control: "number" },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Message", placeholder: "Enter your message" },
};

export const WithHelperText: Story = {
  args: { label: "Bio", helperText: "Tell us about yourself", placeholder: "Your bio..." },
};

export const WithError: Story = {
  args: { label: "Bio", errorMessage: "Bio is required", placeholder: "Your bio..." },
};

export const WithCharacterCount: Story = {
  args: { label: "Bio", maxLength: 200, placeholder: "Max 200 characters..." },
};

export const Disabled: Story = {
  args: { label: "Notes", disabled: true, defaultValue: "Disabled content" },
};

export const ReadOnly: Story = {
  args: { label: "Summary", readOnly: true, defaultValue: "This is read-only content." },
};

export const AutoResize: Story = {
  args: { label: "Message", autoResize: true, minRows: 2, maxRows: 10, placeholder: "Type to expand..." },
};

export const Small: Story = {
  args: { label: "Note", size: "sm", placeholder: "Small textarea" },
};

export const Large: Story = {
  args: { label: "Description", size: "lg", placeholder: "Large textarea" },
};
