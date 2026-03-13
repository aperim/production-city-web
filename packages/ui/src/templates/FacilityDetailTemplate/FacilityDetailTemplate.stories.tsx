import type { Meta, StoryObj } from "@storybook/react-vite";
import { FacilityDetailTemplate } from "./FacilityDetailTemplate";

const meta = {
  title: "Templates/FacilityDetailTemplate",
  component: FacilityDetailTemplate,
  tags: ["autodocs"],
} satisfies Meta<typeof FacilityDetailTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Screen & Sound Stage",
    description: "A professional sound stage with full acoustic isolation, rigging grid, and power distribution designed for feature film, episodic television, and commercial production.",
    specs: [
      { label: "Dimensions", value: "30m x 20m x 12m" },
      { label: "Floor Area", value: "600 sqm" },
      { label: "Sound Rating", value: "NC-25" },
      { label: "Power", value: "400A 3-phase" },
      { label: "Rigging", value: "50-point grid" },
      { label: "Loading", value: "Drive-in access" },
    ],
    useCases: [
      "Feature films",
      "Episodic television",
      "Commercial production",
      "Music videos",
      "Virtual production",
    ],
  },
};

export const Minimal: Story = {
  args: {
    name: "Broadcast Control Room",
    description: "Integrated broadcast control room with multi-camera switching and live streaming capabilities.",
  },
};

export const WithCTA: Story = {
  args: {
    name: "Commercial Sound Stage",
    description: "Versatile space for commercial shoots and smaller productions.",
    specs: [{ label: "Floor Area", value: "300 sqm" }],
    children: (
      <a
        href="#contact"
        style={{
          display: "inline-flex",
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          fontWeight: 500,
          borderRadius: "0.375rem",
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-foreground)",
        }}
      >
        Book This Facility
      </a>
    ),
  },
};
