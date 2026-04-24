import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionHead } from "./SectionHead";

const meta = {
  title: "Molecules/SectionHead",
  component: SectionHead,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SectionHead>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "01 — Operating model",
    heading: "One operator. One campus. Script to delivery.",
  },
};

export const WithLead: Story = {
  args: {
    label: "02 — Facilities",
    heading: "The facilities.",
    lead: "The stages, the volume, the theatre, and the control room were designed as one system.",
  },
};

export const OchreAccent: Story = {
  args: {
    label: "Leadership",
    heading: "First Nations leadership.",
    lead: "Matthew Compton, COO, brings Wiradjuri perspective to everything we build.",
    borderColor: "var(--ochre)",
    labelColor: "var(--ochre)",
  },
};

export const PaperBackground: Story = {
  parameters: {
    backgrounds: { default: "paper" },
  },
  args: {
    label: "Master plan",
    heading: "A campus designed as a system.",
    lead: "Secure stages to the north. Public arrival to the south.",
    borderColor: "var(--rule-paper)",
    labelColor: "var(--muted-paper)",
  },
};
