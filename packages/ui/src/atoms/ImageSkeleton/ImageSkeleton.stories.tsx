import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImageSkeleton } from "./ImageSkeleton";

const meta = {
  title: "Atoms/ImageSkeleton",
  component: ImageSkeleton,
  tags: ["autodocs"],
} satisfies Meta<typeof ImageSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Landscape: Story = {
  args: {
    width: 800,
    height: 600,
  },
};

export const Square: Story = {
  args: {
    width: 400,
    height: 400,
  },
};

export const Portrait: Story = {
  args: {
    width: 400,
    height: 600,
  },
};

export const Widescreen: Story = {
  args: {
    width: 1920,
    height: 1080,
  },
};

export const WithAverageColor: Story = {
  args: {
    width: 800,
    height: 600,
    averageColor: "#8b5cf6",
  },
};

export const WithWarmColor: Story = {
  args: {
    width: 800,
    height: 600,
    averageColor: "#f59e0b",
  },
};
