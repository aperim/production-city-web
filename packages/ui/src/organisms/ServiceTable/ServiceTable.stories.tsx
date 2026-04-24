import type { Meta, StoryObj } from "@storybook/react-vite";
import { ServiceTable } from "./ServiceTable";

const SERVICES = [
  { number: "01", name: "Virtual production", description: "Pre-visualisation through final composite, tight to the stages and the volume." },
  { number: "02", name: "Design & concept", description: "From brief to visual language — the creative groundwork before anyone builds." },
  { number: "03", name: "Set construction", description: "Full-scale fabrication and prototyping, on site, against the drawing." },
  { number: "04", name: "Props", description: "Period-accurate, original, or fantastical — made in the workshop next to the stage." },
  { number: "05", name: "Costume", description: "Patterning, cutting, and making, on site." },
];

const meta = {
  title: "Organisms/ServiceTable",
  component: ServiceTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    rows: SERVICES,
  },
} satisfies Meta<typeof ServiceTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleService: Story = {
  args: {
    rows: [SERVICES[0]],
  },
};
