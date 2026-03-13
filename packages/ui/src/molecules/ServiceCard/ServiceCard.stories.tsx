import type { Meta, StoryObj } from "@storybook/react-vite";
import { ServiceCard } from "./ServiceCard";

const meta = {
  title: "Molecules/ServiceCard",
  component: ServiceCard,
  tags: ["autodocs"],
} satisfies Meta<typeof ServiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Motion Capture",
    description: "Full body and facial capture with real-time preview.",
  },
};

export const WithIcon: Story = {
  args: {
    name: "Set Construction",
    description: "Custom set builds for film, TV, and commercial productions.",
    icon: <span style={{ fontSize: "18px" }}>&#9881;</span>,
  },
};

export const RTL: Story = {
  args: {
    name: "التقاط الحركة",
    description: "التقاط الجسم بالكامل والوجه مع معاينة في الوقت الفعلي.",
  },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar">
        <Story />
      </div>
    ),
  ],
};
