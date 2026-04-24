import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { colors, typography, spacing } from '../src/index.js';

const __srcTokens = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/tokens');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

interface TokenObject {
  [key: string]: string | number | TokenObject;
}

function flattenTokens(obj: TokenObject, prefix: string = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}-${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        Object.assign(result, flattenTokens(value, newKey));
      } else {
        result[newKey] = String(value);
      }
    }
  }
  
  return result;
}

function readCssTokenFile(name: string): string {
  const file = path.join(__srcTokens, name);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function generateCss() {
  // Prepend the brand CSS token files (colors, typography, spacing, breakpoints)
  // so consumers get the primitive `--black`, `--serif`, etc. variables as well as
  // the generated `--pc-color-*`, `--pc-font-*`, `--pc-spacing-*` aliases.
  const brandCss = [
    '/* ── Brand primitive tokens (src/tokens/*.css) ── */',
    readCssTokenFile('colors.css'),
    readCssTokenFile('typography.css'),
    readCssTokenFile('spacing.css'),
    readCssTokenFile('breakpoints.css'),
    '',
    '/* ── Generated alias tokens (from TypeScript constants) ── */',
  ].join('\n');

  const allTokens = {
    color: colors,
    font: typography,
    spacing: spacing,
  };

  const flattened = flattenTokens(allTokens, 'pc');

  let aliasCss = ':root {\n';
  for (const [key, value] of Object.entries(flattened)) {
    const cssVarName = `--${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`;
    aliasCss += `  ${cssVarName}: ${value};\n`;
  }
  aliasCss += '}\n';

  fs.writeFileSync(path.join(distDir, 'tokens.css'), brandCss + '\n' + aliasCss);
  console.log('Generated dist/tokens.css');

  // Also copy the raw index.css so consumers can import just the brand tokens
  fs.writeFileSync(
    path.join(distDir, 'brand-tokens.css'),
    readCssTokenFile('colors.css') + '\n' +
    readCssTokenFile('typography.css') + '\n' +
    readCssTokenFile('spacing.css') + '\n' +
    readCssTokenFile('breakpoints.css'),
  );
  console.log('Generated dist/brand-tokens.css');
}

function generateMdx() {
  let mdx = '# Design Tokens\n\n';
  mdx += 'Reference for all design tokens available in `@productioncity/holding-design-tokens`.\n\n';

  // Colors
  mdx += '## Colors\n\n';
  mdx += '| Token | Value | Preview |\n';
  mdx += '| --- | --- | --- |\n';
  
  const flattenedColors = flattenTokens(colors as TokenObject, 'pc-color');
  for (const [key, value] of Object.entries(flattenedColors)) {
    const varName = `--${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`;
    mdx += `| \`${varName}\` | \`${value}\` | <div style={{backgroundColor: '${value}', width: '20px', height: '20px', border: '1px solid #ddd'}}></div> |\n`;
  }

  // Typography
  mdx += '\n## Typography\n\n';
  mdx += '| Token | Value |\n';
  mdx += '| --- | --- |\n';
  const flattenedTypo = flattenTokens(typography as TokenObject, 'pc-font');
  for (const [key, value] of Object.entries(flattenedTypo)) {
    const varName = `--${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`;
    mdx += `| \`${varName}\` | \`${value}\` |\n`;
  }

  // Spacing
  mdx += '\n## Spacing\n\n';
  mdx += '| Token | Value |\n';
  mdx += '| --- | --- |\n';
  const flattenedSpacing = flattenTokens(spacing as TokenObject, 'pc-spacing');
  for (const [key, value] of Object.entries(flattenedSpacing)) {
    const varName = `--${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`;
    mdx += `| \`${varName}\` | \`${value}\` |\n`;
  }

  fs.writeFileSync(path.join(distDir, 'tokens.mdx'), mdx);
  console.log('Generated dist/tokens.mdx');
}

generateCss();
generateMdx();
