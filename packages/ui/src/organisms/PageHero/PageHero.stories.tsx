import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageHero } from "./PageHero";

const meta = {
  title: "Organisms/PageHero",
  component: PageHero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    heading: "Facilities",
  },
} satisfies Meta<typeof PageHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithEyebrow: Story = {
  args: {
    eyebrow: "Facilities — 01/04",
    lead: "The stages, the volume, the theatre, and the control room were designed as one system.",
  },
};

export const WithGhost: Story = {
  args: {
    eyebrow: "Network · Global sequence",
    heading: "The global sequence.",
    lead: "Production City is being built site by site, not simultaneously.",
    ghost: "01",
  },
};

export const WithCTAs: Story = {
  args: {
    eyebrow: "The company",
    heading: "One operator. One campus.",
    lead: "Production City is an Australian company that designs, builds, and operates vertically integrated content production campuses.",
    ctas: [
      { label: "See the facilities", href: "/facilities", variant: "primary" },
      { label: "The global sequence", href: "/network", variant: "secondary" },
    ],
    ghost: "01",
  },
};

export const Services: Story = {
  args: {
    eyebrow: "Services",
    heading: "Sixteen disciplines. One operator.",
    lead: "One workflow.",
  },
};
