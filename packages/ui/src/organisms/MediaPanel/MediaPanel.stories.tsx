import type { Meta, StoryObj } from "@storybook/react-vite";
import { MediaPanel } from "./MediaPanel";

const meta = {
  title: "Organisms/MediaPanel",
  component: MediaPanel,
  tags: ["autodocs"],
  args: {
    imageSrc: "/media/placeholder-dark.svg",
    imageAlt: "Studio facility",
  },
} satisfies Meta<typeof MediaPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>World-Class Facilities</h2>
        <p style={{ marginTop: "1rem", color: "var(--color-muted-foreground)" }}>
          Production City features state-of-the-art sound stages, post-production suites,
          and creative workspaces designed for the modern production industry.
        </p>
      </div>
    ),
  },
};

export const ImageRight: Story = {
  args: {
    imagePosition: "right",
    children: (
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Creative Services</h2>
        <p style={{ marginTop: "1rem", color: "var(--color-muted-foreground)" }}>
          From VFX to motion capture, our creative services team delivers excellence.
        </p>
      </div>
    ),
  },
};

export const WithAttribution: Story = {
  args: {
    attribution: {
      photographer: "Jane Doe",
      source: "Pexels",
    },
    children: (
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Our Vision</h2>
        <p style={{ marginTop: "1rem", color: "var(--color-muted-foreground)" }}>
          Building Queensland's premier production hub.
        </p>
      </div>
    ),
  },
};
