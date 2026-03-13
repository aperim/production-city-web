import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./Alert";

const meta = {
  title: "Molecules/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["info", "success", "warning", "error"] },
    dismissible: { control: "boolean" },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: "info",
    children: "Your session will expire in 10 minutes.",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    title: "Saved successfully",
    children: "Your changes have been saved.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Deprecation notice",
    children: "This API endpoint will be removed in version 3.0.",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    title: "Upload failed",
    children: "The file could not be uploaded. Please try again.",
  },
};

export const Dismissible: Story = {
  args: {
    variant: "info",
    dismissible: true,
    children: "Click the button to dismiss this alert.",
    onDismiss: () => alert("Dismissed"),
  },
};

export const WithAction: Story = {
  args: {
    variant: "warning",
    title: "Storage almost full",
    children: "You are using 90% of your storage quota.",
    action: <button className="text-sm font-medium underline">Upgrade plan</button>,
  },
};
