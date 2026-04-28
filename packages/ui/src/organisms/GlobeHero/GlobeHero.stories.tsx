import type { Meta, StoryObj } from "@storybook/react-vite";
import { GlobeHero } from "./GlobeHero";

const meta = {
  title: "Organisms/GlobeHero",
  component: GlobeHero,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Interactive Three.js globe background for the landing page hero. WebGL-accelerated. Falls back to plain dark surface if WebGL is unavailable. Respects `prefers-reduced-motion`.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GlobeHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export const WithLabels: Story = {
  args: {
    labels: {
      "australia-sydney": "AUSTRALIA",
      "asia-pacific-singapore": "ASIA PACIFIC",
      "europe-switzerland": "EUROPE",
      "africa-cape-town": "AFRICA",
      "north-america-toronto": "N. AMERICA",
      "north-america-los-angeles": "N. AMERICA",
      oceania: "OCEANIA",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export const WithJapaneseLabels: Story = {
  name: "Japanese labels (i18n)",
  args: {
    labels: {
      "australia-sydney": "オーストラリア",
      "asia-pacific-singapore": "アジア太平洋",
      "europe-switzerland": "ヨーロッパ",
      "africa-cape-town": "アフリカ",
      "north-america-toronto": "北アメリカ",
      "north-america-los-angeles": "北アメリカ",
      oceania: "オセアニア",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100vw", height: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export const EmbeddedInHero: Story = {
  name: "Embedded in hero section",
  args: {
    labels: {
      "australia-sydney": "AUSTRALIA",
      "asia-pacific-singapore": "ASIA PACIFIC",
      "europe-switzerland": "EUROPE",
      "africa-cape-town": "AFRICA",
      "north-america-toronto": "N. AMERICA",
      "north-america-los-angeles": "N. AMERICA",
      oceania: "OCEANIA",
    },
  },
  decorators: [
    (Story) => (
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "48px 24px",
          color: "#f7f5f0",
        }}
      >
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Story />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.35) 100%)",
            }}
          />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900 }}>
          <h1
            style={{
              fontFamily: "serif",
              fontSize: "clamp(56px, 9vw, 168px)",
              fontWeight: "normal",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            We make stories.
          </h1>
          <p style={{ marginTop: 24, maxWidth: "42ch", fontSize: 20, lineHeight: 1.45, color: "#c8bda5" }}>
            A vertically integrated studio campus. Sound stages, LED volume, a broadcast theatre, and the full service stack — built together, in one place.
          </p>
        </div>
      </section>
    ),
  ],
};
