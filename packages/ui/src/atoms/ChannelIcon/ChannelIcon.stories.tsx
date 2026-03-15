import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChannelIcon } from "./ChannelIcon";

const meta = {
  title: "Atoms/ChannelIcon",
  component: ChannelIcon,
  tags: ["autodocs"],
  argTypes: {
    channel: { control: "select", options: ["email", "sms"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof ChannelIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmailSmall: Story = {
  args: { channel: "email", size: "sm" },
};

export const EmailMedium: Story = {
  args: { channel: "email", size: "md" },
};

export const EmailLarge: Story = {
  args: { channel: "email", size: "lg" },
};

export const SmsSmall: Story = {
  args: { channel: "sms", size: "sm" },
};

export const SmsMedium: Story = {
  args: { channel: "sms", size: "md" },
};

export const SmsLarge: Story = {
  args: { channel: "sms", size: "lg" },
};
