import type { Meta, StoryObj } from "@storybook/react-vite";
import { ServiceGrid } from "./ServiceGrid";

const services = [
  { name: "Motion Capture", description: "Full body and facial capture with real-time preview." },
  { name: "Set Construction", description: "Custom set builds for film, TV, and commercial productions." },
  { name: "Post-Production", description: "Editing, color grading, VFX, and sound design." },
  { name: "Virtual Production", description: "LED volume stages with real-time rendering." },
];

const meta = {
  title: "Organisms/ServiceGrid",
  component: ServiceGrid,
  tags: ["autodocs"],
} satisfies Meta<typeof ServiceGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { heading: "Creative Services", services },
};

export const Loading: Story = {
  args: { heading: "Creative Services", services: [], loading: true },
};

export const Empty: Story = {
  args: { heading: "Creative Services", services: [], emptyMessage: "No services available." },
};
