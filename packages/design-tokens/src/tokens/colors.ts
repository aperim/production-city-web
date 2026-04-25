/**
 * Production City — Brand Colour Tokens
 * Source of truth: reference/assets/site.css `:root` block.
 * Black #0A0A0A · Paper #F7F5F0 · Accent Red #D93B2B · Ochre #B45A2A
 */
export const colors = {
  /** Primary — filmic red scale, derived from --accent: #D93B2B */
  primary: {
    50:  '#FDF1EF',
    100: '#FADED9',
    200: '#F5B8B1',
    300: '#EE8E84',
    400: '#E56358',
    500: '#D93B2B',
    600: '#B42D1F',
    700: '#8D2018',
    800: '#681711',
    900: '#460F0B',
    950: '#230705',
  },
  /** Secondary — amber alternate accent, derived from --accent-amber: #E8A53F */
  secondary: {
    50:  '#FEF8EE',
    100: '#FCEFD4',
    200: '#F9DCAA',
    300: '#F5C47D',
    400: '#EEB154',
    500: '#E8A53F',
    600: '#CC8520',
    700: '#9F6518',
    800: '#784B12',
    900: '#50320C',
    950: '#2A1906',
  },
  /** Neutral — paper (#F7F5F0) to black (#0A0A0A) */
  neutral: {
    50:  '#F7F5F0', /* --paper */
    100: '#EFEBE2', /* --paper-2 */
    200: '#D9D4C7', /* --rule-paper */
    300: '#C0BAB0',
    400: '#9C9A92', /* --muted-ink */
    500: '#6C6A62', /* --muted-paper */
    600: '#4A4844',
    700: '#2A2A2A', /* --rule */
    800: '#1C1C1C', /* --charcoal */
    850: '#242424', /* --charcoal-2 */
    900: '#141414', /* --ink */
    950: '#0A0A0A', /* --black */
  },
  semantic: {
    success: {
      50:  '#f0fdf4',
      500: '#22c55e',
      900: '#14532d',
    },
    warning: {
      50:  '#fefce8',
      500: '#eab308',
      900: '#713f12',
    },
    error: {
      50:  '#fef2f2',
      500: '#ef4444',
      900: '#7f1d1d',
    },
    info: {
      50:  '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
  },
  /** Ochre — First Nations contexts only. Do not use decoratively. */
  ochre: '#B45A2A',
} as const;
