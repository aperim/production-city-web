import type { Meta, StoryObj } from "@storybook/react-vite";
import { ForwardLookingDisclaimer } from "./ForwardLookingDisclaimer";

const meta = {
  title: "Organisms/ForwardLookingDisclaimer",
  component: ForwardLookingDisclaimer,
  tags: ["autodocs"],
} satisfies Meta<typeof ForwardLookingDisclaimer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "This page contains forward-looking statements about Production City's planned facilities, locations, and capabilities. These statements are based on current expectations and projections about future events. Actual results may differ materially from those expressed or implied. Production City makes no commitment to update these statements.",
  },
};
