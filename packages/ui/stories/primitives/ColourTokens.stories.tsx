import type { Meta, StoryObj } from "@storybook/react-vite";

interface SwatchProps {
  variable: string;
  label: string;
  value: string;
  note?: string;
}

function Swatch({ variable, label, value, note }: SwatchProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "160px" }}>
      <div
        style={{
          width: "100%",
          height: "64px",
          background: `var(${variable}, ${value})`,
          borderRadius: "4px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />
      <div style={{ fontFamily: "var(--mono, monospace)", fontSize: "11px", letterSpacing: "0.08em" }}>
        <div style={{ opacity: 0.9 }}>{variable}</div>
        <div style={{ opacity: 0.55 }}>{value}</div>
        {note && <div style={{ opacity: 0.4, marginTop: "2px", fontStyle: "italic" }}>{note}</div>}
      </div>
      <div style={{ fontSize: "12px", opacity: 0.7 }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "48px" }}>
      <h2
        style={{
          fontFamily: "var(--mono, monospace)",
          fontSize: "11px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: 0.55,
          marginBottom: "24px",
          borderBottom: "1px solid var(--rule, #2A2A2A)",
          paddingBottom: "12px",
        }}
      >
        {title}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>{children}</div>
    </section>
  );
}

function ColourTokens() {
  return (
    <div
      style={{
        padding: "40px",
        background: "var(--black, #0A0A0A)",
        color: "var(--paper, #F7F5F0)",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--serif, serif)",
          fontSize: "clamp(32px, 4vw, 56px)",
          fontWeight: 400,
          letterSpacing: "-0.01em",
          marginBottom: "40px",
        }}
      >
        Colour Tokens
      </h1>

      <Section title="Foundational Neutrals">
        <Swatch variable="--black" value="#0A0A0A" label="Black" />
        <Swatch variable="--ink" value="#141414" label="Ink" />
        <Swatch variable="--charcoal" value="#1C1C1C" label="Charcoal" />
        <Swatch variable="--charcoal-2" value="#242424" label="Charcoal 2" />
        <Swatch variable="--rule" value="#2A2A2A" label="Rule (dark)" />
        <Swatch variable="--muted-ink" value="#9C9A92" label="Muted Ink" />
        <Swatch variable="--muted-paper" value="#6C6A62" label="Muted Paper" />
        <Swatch variable="--rule-paper" value="#D9D4C7" label="Rule (light)" />
        <Swatch variable="--paper-2" value="#EFEBE2" label="Paper 2" />
        <Swatch variable="--paper" value="#F7F5F0" label="Paper" />
      </Section>

      <Section title="Accent Palette">
        <Swatch
          variable="--accent"
          value="#D93B2B"
          label="Accent — Filmic Red"
          note="default brand accent"
        />
        <Swatch
          variable="--accent-amber"
          value="#E8A53F"
          label="Accent Amber"
          note="alternate accent"
        />
        <Swatch
          variable="--ochre"
          value="#B45A2A"
          label="Ochre"
          note="First Nations contexts only"
        />
      </Section>
    </div>
  );
}

const meta = {
  title: "Primitives/ColourTokens",
  component: ColourTokens,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Production City brand colour primitives. All extracted from `reference/assets/site.css`. Use semantic `--color-*` tokens in components — these are the raw values they resolve to.",
      },
    },
  },
} satisfies Meta<typeof ColourTokens>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
