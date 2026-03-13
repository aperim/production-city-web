import type { Meta, StoryObj } from "@storybook/react-vite";
import { FacilityShowcase } from "./FacilityShowcase";

const facilities = [
  { name: "Screen & Sound Stage", description: "Professional sound stage with full acoustic isolation and rigging grid.", specs: [{ label: "Dimensions", value: "30m x 20m x 12m" }, { label: "Sound Rating", value: "NC-25" }] },
  { name: "Commercial Sound Stage", description: "Versatile space for commercial shoots and smaller productions." },
  { name: "Broadcast Theatre", description: "Multi-camera broadcast facility with integrated control room.", specs: [{ label: "Cameras", value: "8 positions" }] },
];

const meta = {
  title: "Organisms/FacilityShowcase",
  component: FacilityShowcase,
  tags: ["autodocs"],
} satisfies Meta<typeof FacilityShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { heading: "Our Facilities", intro: "World-class production facilities designed for every stage of content creation.", facilities },
};

export const Loading: Story = {
  args: { heading: "Our Facilities", facilities: [], loading: true },
};

export const Empty: Story = {
  args: { heading: "Our Facilities", facilities: [], emptyMessage: "No facilities found." },
};
