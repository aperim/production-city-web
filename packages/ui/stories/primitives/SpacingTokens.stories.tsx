import type { Meta, StoryObj } from "@storybook/react-vite";

function SpacingBar({
  variable,
  value,
  label,
}: {
  variable: string;
  value: string;
  label: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
      <div
        style={{
          width: `var(${variable}, ${value})`,
          height: "24px",
          background: "var(--accent, #D93B2B)",
          borderRadius: "2px",
          flexShrink: 0,
          minWidth: "4px",
          maxWidth: "100%",
        }}
      />
      <div
        style={{
          fontFamily: "var(--mono, monospace)",
          fontSize: "11px",
          letterSpacing: "0.08em",
          opacity: 0.7,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ opacity: 0.55 }}>{variable}</span>
        <span style={{ marginLeft: "8px" }}>{value}</span>
        <span style={{ marginLeft: "8px", opacity: 0.4 }}>{label}</span>
      </div>
    </div>
  );
}

function SpacingTokens() {
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
          marginBottom: "48px",
        }}
      >
        Spacing Tokens
      </h1>

      <section style={{ marginBottom: "64px" }}>
        <h2
          style={{
            fontFamily: "var(--mono, monospace)",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.45,
            marginBottom: "32px",
          }}
        >
          Fixed Scale
        </h2>
        <SpacingBar variable="--space-1" value="4px" label="xs" />
        <SpacingBar variable="--space-2" value="8px" label="sm" />
        <SpacingBar variable="--space-3" value="12px" label="" />
        <SpacingBar variable="--space-4" value="16px" label="md" />
        <SpacingBar variable="--space-5" value="20px" label="" />
        <SpacingBar variable="--space-6" value="24px" label="lg" />
        <SpacingBar variable="--space-8" value="32px" label="xl" />
        <SpacingBar variable="--space-10" value="40px" label="" />
        <SpacingBar variable="--space-12" value="48px" label="2xl" />
        <SpacingBar variable="--space-14" value="56px" label="" />
        <SpacingBar variable="--space-16" value="64px" label="3xl" />
        <SpacingBar variable="--space-20" value="80px" label="" />
        <SpacingBar variable="--space-24" value="96px" label="4xl" />
        <SpacingBar variable="--space-32" value="128px" label="5xl" />
      </section>

      <section style={{ marginBottom: "64px" }}>
        <h2
          style={{
            fontFamily: "var(--mono, monospace)",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.45,
            marginBottom: "32px",
          }}
        >
          Fluid Layout Tokens
        </h2>
        <div
          style={{
            display: "grid",
            gap: "16px",
            fontFamily: "var(--mono, monospace)",
            fontSize: "12px",
          }}
        >
          {[
            { variable: "--gutter", value: "clamp(20px, 4vw, 64px)", note: "horizontal page gutter" },
            { variable: "--section-padding", value: "clamp(56px, 8vw, 128px)", note: ".section vertical padding" },
            { variable: "--section-padding-tight", value: "clamp(40px, 5vw, 80px)", note: ".section-tight" },
            { variable: "--hero-padding", value: "clamp(48px, 6vw, 96px)", note: "hero vertical padding" },
            { variable: "--max", value: "1440px", note: "standard container max-width" },
            { variable: "--max-wide", value: "1720px", note: "wide container (.wrap-wide)" },
            { variable: "--header-height", value: "64px", note: "sticky header" },
            { variable: "--grid-gap", value: "clamp(16px, 2vw, 32px)", note: "12-col grid gap" },
            { variable: "--grid-gap-2col", value: "clamp(24px, 3vw, 64px)", note: "2-col grid gap" },
          ].map(({ variable, value, note }) => (
            <div
              key={variable}
              style={{
                display: "grid",
                gridTemplateColumns: "200px 260px 1fr",
                gap: "16px",
                padding: "12px 0",
                borderBottom: "1px solid var(--rule, #2A2A2A)",
              }}
            >
              <span style={{ color: "var(--muted-ink, #9C9A92)" }}>{variable}</span>
              <span style={{ color: "var(--paper, #F7F5F0)" }}>{value}</span>
              <span style={{ color: "var(--muted-paper, #6C6A62)", fontStyle: "italic" }}>{note}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: "Primitives/SpacingTokens",
  component: SpacingTokens,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Production City spacing primitives. Fixed scale for component internals; fluid tokens for layout sections. Values from `reference/assets/site.css`.",
      },
    },
  },
} satisfies Meta<typeof SpacingTokens>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
