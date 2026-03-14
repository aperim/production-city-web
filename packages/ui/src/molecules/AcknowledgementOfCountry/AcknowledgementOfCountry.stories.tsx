import type { Meta, StoryObj } from "@storybook/react-vite";
import { AcknowledgementOfCountry } from "./AcknowledgementOfCountry";

const meta = {
  title: "Molecules/AcknowledgementOfCountry",
  component: AcknowledgementOfCountry,
  tags: ["autodocs"],
  args: {
    heading: "Acknowledgement of Country",
    text: "We acknowledge the Traditional Owners of the land on which we operate. We pay our respects to Elders past, present, and emerging.",
  },
} satisfies Meta<typeof AcknowledgementOfCountry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { compact: true },
};
