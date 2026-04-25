import { describe, it, expect } from 'vitest';
import { colors, typography, spacing, breakpoints } from './index.js';

describe('Design Tokens', () => {
  it('should export colors with PC brand values', () => {
    expect(colors).toBeDefined();
    expect(colors.primary).toBeDefined();
    expect(colors.primary[500]).toBe('#D93B2B'); /* filmic red */
    expect(colors.neutral[950]).toBe('#0A0A0A'); /* --black */
    expect(colors.neutral[50]).toBe('#F7F5F0');  /* --paper */
    expect(colors.ochre).toBe('#B45A2A');
  });

  it('should export typography with PC font stacks', () => {
    expect(typography).toBeDefined();
    expect(typography.fontFamily).toBeDefined();
    expect(typography.fontFamily.primary).toContain('Inter Tight');
    expect(typography.fontFamily.secondary).toContain('Source Serif 4');
    expect(typography.fontFamily.mono).toContain('JetBrains Mono');
    expect(typography.scale).toBeDefined();
    expect(typography.scale.display).toContain('clamp');
  });

  it('should export spacing', () => {
    expect(spacing).toBeDefined();
    expect(spacing[4]).toBeDefined();
  });

  it('should export breakpoints', () => {
    expect(breakpoints).toBeDefined();
    expect(breakpoints.lg).toBe(820);
    expect(breakpoints['2xl']).toBe(980);
  });
});
