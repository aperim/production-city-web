import { describe, it, expect } from 'vitest';
import { colors, typography, spacing } from './index.js';

describe('Design Tokens', () => {
  it('should export colors', () => {
    expect(colors).toBeDefined();
    expect(colors.primary).toBeDefined();
    expect(colors.primary[500]).toBeDefined();
  });

  it('should export typography', () => {
    expect(typography).toBeDefined();
    expect(typography.fontFamily).toBeDefined();
    expect(typography.scale).toBeDefined();
  });

  it('should export spacing', () => {
    expect(spacing).toBeDefined();
    expect(spacing[4]).toBeDefined();
  });
});
