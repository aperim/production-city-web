import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatValue } from "./StatValue";

const meta = {
  title: "Atoms/StatValue",
  component: StatValue,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact"],
    },
  },
} satisfies Meta<typeof StatValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "2,025 sqm", label: "Total Area" },
};

export const Compact: Story = {
  args: { value: "450", label: "Seats", variant: "compact" },
};

export const LargeNumber: Story = {
  args: { value: "1,200,000", label: "Annual Visitors" },
};

export const RTL: Story = {
  args: { value: "٢,٠٢٥ متر مربع", label: "المساحة الإجمالية" },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar">
        <Story />
      </div>
    ),
  ],
};
