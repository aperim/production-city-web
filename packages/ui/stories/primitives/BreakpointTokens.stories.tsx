import type { Meta, StoryObj } from "@storybook/react-vite";

const BREAKPOINTS = [
  { name: "sm", value: 560, usage: "Audience grid single column" },
  { name: "md", value: 720, usage: "Service rows, section heads stack" },
  { name: "lg", value: 820, usage: "12-col grid, footer, network grid collapse" },
  { name: "xl", value: 900, usage: "Company / facilities 2-col layouts collapse" },
  { name: "2xl", value: 980, usage: "Header nav visible / hidden toggle" },
] as const;

function BreakpointTokens() {
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
        Breakpoint Tokens
      </h1>

      <p
        style={{
          fontFamily: "var(--sans, sans-serif)",
          fontSize: "var(--font-size-lead, clamp(19px, 1.6vw, 24px))",
          lineHeight: 1.45,
          maxWidth: "52ch",
          opacity: 0.8,
          marginBottom: "48px",
        }}
      >
        Breakpoints are defined as <code>--bp-*</code> CSS custom properties for documentation and
        tooling. CSS media queries must still use literal pixel values — custom properties cannot
        be used inside <code>@media</code> rules.
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "var(--mono, monospace)",
          fontSize: "13px",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rule, #2A2A2A)" }}>
            {["Name", "CSS Variable", "Value", "max-width breakpoint", "Usage"].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  padding: "8px 16px 8px 0",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--muted-ink, #9C9A92)",
                  fontWeight: 500,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BREAKPOINTS.map(({ name, value, usage }) => (
            <tr
              key={name}
              style={{
                borderBottom: "1px solid var(--charcoal, #1C1C1C)",
              }}
            >
              <td style={{ padding: "14px 16px 14px 0", color: "var(--paper, #F7F5F0)" }}>{name}</td>
              <td style={{ padding: "14px 16px 14px 0", color: "var(--accent, #D93B2B)" }}>
                --bp-{name}
              </td>
              <td style={{ padding: "14px 16px 14px 0" }}>{value}px</td>
              <td style={{ padding: "14px 16px 14px 0", color: "var(--muted-ink, #9C9A92)" }}>
                @media (max-width: {value}px)
              </td>
              <td
                style={{
                  padding: "14px 16px 14px 0",
                  color: "var(--muted-paper, #6C6A62)",
                  fontFamily: "var(--sans, sans-serif)",
                  fontSize: "13px",
                }}
              >
                {usage}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "48px",
          padding: "24px",
          background: "var(--charcoal, #1C1C1C)",
          borderRadius: "4px",
          borderLeft: "3px solid var(--accent, #D93B2B)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--mono, monospace)",
            fontSize: "12px",
            lineHeight: 1.6,
            margin: 0,
            color: "var(--muted-ink, #9C9A92)",
          }}
        >
          The reference site is mobile-first and uses max-width media queries for breakpoints.
          In new components, prefer min-width queries. JS access: import{" "}
          <code style={{ color: "var(--paper, #F7F5F0)" }}>{"{ breakpoints }"}</code> from{" "}
          <code style={{ color: "var(--paper, #F7F5F0)" }}>
            @productioncity/holding-design-tokens
          </code>
          .
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: "Primitives/BreakpointTokens",
  component: BreakpointTokens,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Production City responsive breakpoints. Extracted from `reference/assets/site.css` media queries. Use `--bp-*` CSS custom properties for tooling; literal px values in `@media` rules.",
      },
    },
  },
} satisfies Meta<typeof BreakpointTokens>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
