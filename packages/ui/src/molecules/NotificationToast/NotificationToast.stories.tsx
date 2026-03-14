import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationToast } from "./NotificationToast";

const meta = {
  title: "Molecules/NotificationToast",
  component: NotificationToast,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["info", "success", "warning"] },
  },
} satisfies Meta<typeof NotificationToast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: { message: "New expression of interest received", variant: "info", onDismiss: () => {} },
};

export const Success: Story = {
  args: { message: "User approval processed", variant: "success", onDismiss: () => {} },
};

export const Warning: Story = {
  args: { message: "New user waiting for approval", variant: "warning", onDismiss: () => {} },
};

export const WithoutDismiss: Story = {
  args: { message: "Email delivered", variant: "success" },
};

export const AllVariants: StoryObj = {
  render: () => (
    <div className="flex flex-col gap-2 max-w-sm">
      <NotificationToast message="Info notification" variant="info" onDismiss={() => {}} />
      <NotificationToast message="Success notification" variant="success" onDismiss={() => {}} />
      <NotificationToast message="Warning notification" variant="warning" onDismiss={() => {}} />
    </div>
  ),
};
