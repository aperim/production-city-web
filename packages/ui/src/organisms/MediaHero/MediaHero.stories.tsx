import type { Meta, StoryObj } from "@storybook/react-vite";
import { MediaHero } from "./MediaHero";

const meta = {
  title: "Organisms/MediaHero",
  component: MediaHero,
  tags: ["autodocs"],
  args: {
    lightSrc: "/media/placeholder-light.svg",
    darkSrc: "/media/placeholder-dark.svg",
    alt: "Hero image",
    width: 1920,
    height: 600,
    photographer: "Jane Doe",
    photographerUrl: "https://example.com/jane",
    source: "Pexels",
    sourceUrl: "https://pexels.com",
  },
} satisfies Meta<typeof MediaHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithOverlayHeading: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to Production City</h1>
        <p className="mt-2 text-lg text-white/80">Building the future of media management.</p>
      </div>
    ),
  },
};

export const WithCtaButton: Story = {
  args: {
    children: (
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Get Started</h1>
        <p className="mt-2 text-white/80">Sign up today for early access.</p>
        <button
          type="button"
          className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90"
        >
          Sign Up
        </button>
      </div>
    ),
  },
};

export const WithoutOverlay: Story = {
  args: {
    children: undefined,
  },
};

export const WithBadges: Story = {
  args: {
    aiAssisted: true,
    hasFirstNationsPermission: true,
    children: (
      <h1 className="text-3xl font-semibold tracking-tight">Cultural Heritage</h1>
    ),
  },
};

export const TallHero: Story = {
  args: {
    height: 800,
    children: (
      <h1 className="text-3xl font-semibold tracking-tight">Full Impact</h1>
    ),
  },
};
