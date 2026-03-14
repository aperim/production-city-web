import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrandAccentDivider } from "./BrandAccentDivider";

const meta: Meta<typeof BrandAccentDivider> = {
  title: "Organisms/BrandAccentDivider",
  component: BrandAccentDivider,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ padding: "2rem" }}>
        <p style={{ marginBottom: "2rem" }}>Content above the divider</p>
        <Story />
        <p style={{ marginTop: "2rem" }}>Content below the divider</p>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Gradient: Story = {
  args: {
    variant: "gradient",
  },
};

export const CenteredPrimary: Story = {
  args: {
    variant: "primary",
    width: "centered",
  },
};

export const CenteredGradient: Story = {
  args: {
    variant: "gradient",
    width: "centered",
  },
};
