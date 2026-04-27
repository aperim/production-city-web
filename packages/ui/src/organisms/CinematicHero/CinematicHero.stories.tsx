import type { Meta, StoryObj } from "@storybook/react-vite";
import { CinematicHero } from "./CinematicHero";

const meta = {
  title: "Organisms/CinematicHero",
  component: CinematicHero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    imageSrc: "/media/placeholder-dark.svg",
    imageAlt: "Cinematic studio hero",
    title: "Production City",
  },
} satisfies Meta<typeof CinematicHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSubtitle: Story = {
  args: {
    subtitle: "Where stories come to life",
  },
};

export const WithCTAs: Story = {
  args: {
    subtitle: "The future of production in Sydney",
    ctas: [
      { label: "Register Interest", href: "/register", variant: "primary" },
      { label: "Learn More", href: "/about", variant: "secondary" },
    ],
  },
};

export const TallHeight: Story = {
  args: {
    height: "tall",
    subtitle: "80vh hero variant",
  },
};

export const MediumHeight: Story = {
  args: {
    height: "medium",
    subtitle: "60vh hero variant",
  },
};

export const LightOverlay: Story = {
  args: {
    overlay: "light",
    subtitle: "Light overlay for bright images",
  },
};

export const NoOverlay: Story = {
  args: {
    overlay: "none",
  },
};

export const NoOverlayWithContent: Story = {
  args: {
    overlay: "none",
    subtitle: "Text-shadow safety floor — readable without gradient overlay",
    ctas: [
      { label: "Register Interest", href: "/register", variant: "primary" },
    ],
    attribution: {
      photographer: "John Smith",
      source: "Pexels",
    },
  },
};

export const WithAttribution: Story = {
  args: {
    subtitle: "World-class facilities",
    attribution: {
      photographer: "John Smith",
      source: "Pexels",
    },
  },
};

export const WithParallax: Story = {
  args: {
    subtitle: "Scroll to see parallax effect (10px offset demo)",
    parallaxOffset: 10,
  },
};
