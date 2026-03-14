import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollRevealSection } from "./ScrollRevealSection";

const meta = {
  title: "Organisms/ScrollRevealSection",
  component: ScrollRevealSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ScrollRevealSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 600 }}>
          Scroll to reveal this content
        </h2>
        <p style={{ marginTop: "1rem", color: "var(--color-muted-foreground)" }}>
          This section fades in when it enters the viewport.
        </p>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <div>
        <div style={{ height: "120vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Scroll down to see the reveal effect</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const FadeDirection: Story = {
  args: {
    direction: "fade",
    children: (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 600 }}>Fade only</h2>
        <p style={{ marginTop: "1rem" }}>No vertical translation, just opacity.</p>
      </div>
    ),
  },
};

export const WithDelay: Story = {
  args: {
    delay: 300,
    children: (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 600 }}>Delayed reveal</h2>
        <p style={{ marginTop: "1rem" }}>300ms stagger delay.</p>
      </div>
    ),
  },
};
