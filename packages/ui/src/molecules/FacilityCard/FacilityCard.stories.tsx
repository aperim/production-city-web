import type { Meta, StoryObj } from "@storybook/react-vite";
import { FacilityCard } from "./FacilityCard";

const meta = {
  title: "Molecules/FacilityCard",
  component: FacilityCard,
  tags: ["autodocs"],
} satisfies Meta<typeof FacilityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Screen & Sound Stage",
    description: "Professional sound stage with full acoustic isolation and rigging grid.",
  },
};

export const WithSpecs: Story = {
  args: {
    name: "Screen & Sound Stage",
    description: "Professional sound stage with full acoustic isolation.",
    specs: [
      { label: "Dimensions", value: "30m x 20m x 12m" },
      { label: "Capacity", value: "200 people" },
      { label: "Sound Rating", value: "NC-25" },
      { label: "Power", value: "400A 3-phase" },
    ],
  },
};

export const WithLink: Story = {
  args: {
    name: "Broadcast Theatre",
    description: "Multi-camera broadcast facility with integrated control room.",
    href: "#broadcast-theatre",
  },
};

export const RTL: Story = {
  args: {
    name: "مسرح البث",
    description: "منشأة بث متعددة الكاميرات مع غرفة تحكم متكاملة.",
    specs: [
      { label: "الأبعاد", value: "30م × 20م" },
      { label: "السعة", value: "200 شخص" },
    ],
  },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar">
        <Story />
      </div>
    ),
  ],
};
