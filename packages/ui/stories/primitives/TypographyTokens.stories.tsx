import type { Meta, StoryObj } from "@storybook/react-vite";

function Specimen({
  label,
  variable,
  value,
  style,
  text = "The quick brown fox",
}: {
  label: string;
  variable: string;
  value: string;
  style?: React.CSSProperties;
  text?: string;
}) {
  return (
    <div
      style={{
        borderBottom: "1px solid var(--rule, #2A2A2A)",
        paddingBottom: "24px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono, monospace)",
          fontSize: "11px",
          letterSpacing: "0.12em",
          opacity: 0.45,
          marginBottom: "12px",
          display: "flex",
          gap: "16px",
        }}
      >
        <span>{label}</span>
        <span style={{ opacity: 0.6 }}>{variable}</span>
        <span style={{ opacity: 0.45 }}>{value}</span>
      </div>
      <div style={style}>{text}</div>
    </div>
  );
}

function TypographyTokens() {
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
        Typography Tokens
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
          Font Families
        </h2>

        <Specimen
          label="--serif"
          variable="--serif"
          value='"Source Serif 4", ...'
          style={{ fontFamily: "var(--serif, serif)", fontSize: "24px" }}
          text="Source Serif 4 — Editorial, cinematic, authoritative"
        />
        <Specimen
          label="--sans"
          variable="--sans"
          value='"Inter Tight", ...'
          style={{ fontFamily: "var(--sans, sans-serif)", fontSize: "24px" }}
          text="Inter Tight — Functional, precise, legible"
        />
        <Specimen
          label="--mono"
          variable="--mono"
          value='"JetBrains Mono", ...'
          style={{ fontFamily: "var(--mono, monospace)", fontSize: "20px" }}
          text="JetBrains Mono — Technical, structured, data-oriented"
        />
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
          Fluid Type Scale
        </h2>

        <Specimen
          label="Display"
          variable="--font-size-display"
          value="clamp(56px, 9vw, 168px)"
          style={{
            fontFamily: "var(--serif, serif)",
            fontSize: "var(--font-size-display, clamp(56px, 9vw, 168px))",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 0.95,
          }}
          text="Display"
        />
        <Specimen
          label="H1"
          variable="--font-size-h1"
          value="clamp(40px, 6vw, 96px)"
          style={{
            fontFamily: "var(--serif, serif)",
            fontSize: "var(--font-size-h1, clamp(40px, 6vw, 96px))",
            fontWeight: 400,
            letterSpacing: "-0.015em",
            lineHeight: 1.0,
          }}
          text="Production City"
        />
        <Specimen
          label="H2"
          variable="--font-size-h2"
          value="clamp(32px, 4vw, 56px)"
          style={{
            fontFamily: "var(--serif, serif)",
            fontSize: "var(--font-size-h2, clamp(32px, 4vw, 56px))",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
          }}
          text="Virtual Production Hub"
        />
        <Specimen
          label="H3"
          variable="--font-size-h3"
          value="clamp(22px, 2vw, 30px)"
          style={{
            fontFamily: "var(--serif, serif)",
            fontSize: "var(--font-size-h3, clamp(22px, 2vw, 30px))",
            fontWeight: 400,
            letterSpacing: "-0.005em",
            lineHeight: 1.15,
          }}
          text="World-class facilities"
        />
        <Specimen
          label="Lead"
          variable="--font-size-lead"
          value="clamp(19px, 1.6vw, 24px)"
          style={{
            fontFamily: "var(--sans, sans-serif)",
            fontSize: "var(--font-size-lead, clamp(19px, 1.6vw, 24px))",
            lineHeight: 1.45,
          }}
          text="The intersection of craft and technology in South-East Queensland."
        />
        <Specimen
          label="Body"
          variable="--font-size-body"
          value="17px"
          style={{
            fontFamily: "var(--sans, sans-serif)",
            fontSize: "var(--font-size-body, 17px)",
            lineHeight: 1.55,
          }}
          text="Production City delivers integrated virtual production, broadcast, post-production, and education facilities for the modern screen industry."
        />
        <Specimen
          label="Eyebrow"
          variable="--font-size-eyebrow"
          value="11px"
          style={{
            fontFamily: "var(--mono, monospace)",
            fontSize: "var(--font-size-eyebrow, 11px)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
          text="Services · Virtual Production"
        />
      </section>
    </div>
  );
}

const meta = {
  title: "Primitives/TypographyTokens",
  component: TypographyTokens,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Production City typography primitives. Fluid type scale uses `clamp()` for viewport-responsive sizing. All values extracted from `reference/assets/site.css`.",
      },
    },
  },
} satisfies Meta<typeof TypographyTokens>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
