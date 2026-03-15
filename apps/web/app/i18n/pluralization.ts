/**
 * ICU-style pluralization engine for i18n.
 *
 * Uses Intl.PluralRules for locale-aware plural category selection.
 * Parses ICU plural syntax without dynamic code evaluation (Finding #20).
 * Bounded nesting depth to prevent stack overflow (Finding #20).
 *
 * @module pluralization
 */

/** Maximum nesting depth for ICU plural form values. */
const MAX_NESTING_DEPTH = 10;

/** Valid CLDR plural categories. */
type PluralCategory = "zero" | "one" | "two" | "few" | "many" | "other";

/** Parsed ICU plural structure. */
export interface ICUPluralResult {
  variable: string;
  forms: Record<string, string>;
}

/**
 * Get the CLDR plural category for a count in a given locale.
 * Uses Intl.PluralRules which implements full CLDR rules.
 */
/** Cache for Intl.PluralRules instances per locale (Codex Finding: avoid per-render allocation). */
const pluralRulesCache = new Map<string, Intl.PluralRules>();

export function getPluralCategory(locale: string, count: number): PluralCategory {
  let rules = pluralRulesCache.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(locale);
    pluralRulesCache.set(locale, rules);
  }
  return rules.select(count) as PluralCategory;
}

/**
 * Parse an ICU plural string into its variable name and form map.
 *
 * Expected format: {variable, plural, form1 {text1} form2 {text2} ...}
 * Forms can be: =N (exact match), zero, one, two, few, many, other
 *
 * Returns null if the string is not a valid ICU plural or exceeds nesting limits.
 */
export function parseICUPlural(value: string): ICUPluralResult | null {
  // Quick check: must start with { and end with }
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;

  // Match the outer structure: {variable, plural, ...forms...}
  const outerMatch = trimmed.match(/^\{(\w+),\s*plural\s*,\s*([\s\S]*)\}$/);
  if (!outerMatch) return null;

  const variable = outerMatch[1]!;
  const formsStr = outerMatch[2]!;

  // Check nesting depth before parsing
  let maxDepth = 0;
  let currentDepth = 0;
  for (const ch of formsStr) {
    if (ch === "{") {
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;
      if (currentDepth > MAX_NESTING_DEPTH) return null;
    }
    if (ch === "}") currentDepth--;
    if (currentDepth < 0) return null;
  }
  if (currentDepth !== 0) return null;

  // Parse individual forms at top-level only (depth 0) using manual scanning.
  // This prevents nested ICU constructs from polluting the outer form map (Codex Finding).
  const forms: Record<string, string> = {};
  const formKeywords = /\s*(=\d+|zero|one|two|few|many|other)\s*\{/g;
  let keywordMatch: ReturnType<typeof formKeywords.exec>;

  while ((keywordMatch = formKeywords.exec(formsStr)) !== null) {
    // Verify this match is at top-level (no unmatched braces before it)
    let precedingDepth = 0;
    for (let j = 0; j < keywordMatch.index; j++) {
      if (formsStr[j] === "{") precedingDepth++;
      if (formsStr[j] === "}") precedingDepth--;
    }
    if (precedingDepth !== 0) continue; // Skip nested form keywords

    const keyword = keywordMatch[1]!;
    const startIndex = keywordMatch.index + keywordMatch[0].length;

    // Find the matching closing brace via manual counting
    let depth = 1;
    let i = startIndex;
    while (i < formsStr.length && depth > 0) {
      if (formsStr[i] === "{") depth++;
      if (formsStr[i] === "}") depth--;
      i++;
    }

    if (depth !== 0) return null; // Unbalanced braces

    forms[keyword] = formsStr.slice(startIndex, i - 1);
  }

  if (Object.keys(forms).length === 0) return null;

  return { variable, forms };
}

/**
 * Resolve an ICU plural template with the given params and locale.
 *
 * If the value is not an ICU plural string, returns it unchanged.
 * Replaces # with the count value and {param} with param values.
 */
export function resolvePlural(
  value: string,
  params: Record<string, string | number>,
  locale: string,
): string {
  const parsed = parseICUPlural(value);
  if (!parsed) return value;

  const count = Number(params[parsed.variable] ?? 0);

  // Check exact matches first (=0, =1, etc.)
  const exactKey = `=${count}`;
  let form = parsed.forms[exactKey];

  if (form === undefined) {
    // Use Intl.PluralRules for the locale
    const category = getPluralCategory(locale, count);
    form = parsed.forms[category] ?? parsed.forms["other"] ?? "";
  }

  // Replace # with the count value
  let result = form.replace(/#/g, String(count));

  // Replace {param} placeholders (but not ICU syntax)
  result = result.replace(/\{(\w+)\}/g, (fullMatch, name: string) => {
    if (name === parsed.variable) return String(count);
    return params[name] !== undefined ? String(params[name]) : fullMatch;
  });

  return result;
}
