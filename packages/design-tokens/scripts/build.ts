import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { colors, typography, spacing } from '../src/index.js';

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

function generateCss() {
  const allTokens = {
    color: colors,
    font: typography,
    spacing: spacing,
  };

  const flattened = flattenTokens(allTokens, 'pc');
  
  let css = ':root {\n';
  for (const [key, value] of Object.entries(flattened)) {
    // Convert camelCase to kebab-case for keys if needed, but here keys are mostly simple or numeric.
    // However, `fontFamily` -> `font-family`.
    const cssVarName = `--${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`;
    css += `  ${cssVarName}: ${value};\n`;
  }
  css += '}\n';

  fs.writeFileSync(path.join(distDir, 'tokens.css'), css);
  console.log('Generated dist/tokens.css');
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
