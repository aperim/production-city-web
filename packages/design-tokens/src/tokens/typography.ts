/**
 * Production City — Typography Tokens
 * Source of truth: reference/assets/site.css
 */
export const typography = {
  fontFamily: {
    /** --sans: Inter Tight stack */
    primary: '"Inter Tight", "Inter", "Neue Haas Grotesk", "Söhne", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
    /** --serif: Source Serif 4 stack */
    secondary: '"Source Serif 4", "Source Serif Pro", "GT Sectra", Georgia, "Times New Roman", serif',
    /** --mono: JetBrains Mono stack */
    mono: '"JetBrains Mono", "Söhne Mono", "IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
  },
  lineHeight: {
    display:  0.95,
    h1:       1.0,
    h2:       1.05,
    h3:       1.15,
    lead:     1.45,
    body:     1.55,
    prose:    1.6,
    hugeNum:  0.85,
  },
  letterSpacing: {
    display:   '-0.02em',
    h1:        '-0.015em',
    h2:        '-0.01em',
    h3:        '-0.005em',
    hugeNum:   '-0.03em',
    eyebrow:    '0.18em',
    smallCaps:  '0.14em',
    nav:        '0.02em',
    btn:        '0.16em',
  },
  scale: {
    display:  'clamp(56px, 9vw, 168px)',
    h1:       'clamp(40px, 6vw, 96px)',
    h2:       'clamp(32px, 4vw, 56px)',
    h3:       'clamp(22px, 2vw, 30px)',
    lead:     'clamp(19px, 1.6vw, 24px)',
    heroSub:  'clamp(18px, 1.8vw, 26px)',
    hugeNum:  'clamp(64px, 9vw, 144px)',
    body:     '17px',
    prose:    '18px',
    eyebrow:  '11px',
    smallCaps:'12px',
    nav:      '13px',
  },
} as const;
