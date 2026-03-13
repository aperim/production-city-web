import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemedImage } from "./ThemedImage";

const meta = {
  title: "Molecules/ThemedImage",
  component: ThemedImage,
  tags: ["autodocs"],
  args: {
    width: 800,
    height: 600,
  },
} satisfies Meta<typeof ThemedImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    lightSrc: "/media/placeholder-light.svg",
    darkSrc: "/media/placeholder-dark.svg",
    alt: "Placeholder themed image",
  },
};

export const SingleVariant: Story = {
  args: {
    lightSrc: "/media/placeholder-light.svg",
    alt: "Single variant image (light only)",
  },
};

export const WithAverageColor: Story = {
  args: {
    lightSrc: "/media/placeholder-light.svg",
    darkSrc: "/media/placeholder-dark.svg",
    alt: "Image with colored skeleton",
    averageColor: "#6366f1",
  },
};

export const EagerLoading: Story = {
  args: {
    lightSrc: "/media/placeholder-light.svg",
    alt: "Eagerly loaded image",
    loading: "eager",
    fetchPriority: "high",
  },
};

export const ErrorState: Story = {
  args: {
    lightSrc: "/media/nonexistent-image.jpg",
    alt: "Image that will fail to load",
  },
};

export const ExternalUrlRejected: Story = {
  args: {
    lightSrc: "https://images.pexels.com/invalid.jpg",
    alt: "External URL should be rejected",
  },
};
