/**
 * Slug generation utility.
 * Lowercase, hyphenated, ASCII-safe. Appends -2, -3 etc. for duplicates.
 */

/**
 * Generate a URL-safe slug from a string.
 * Converts to lowercase, replaces non-alphanumeric chars with hyphens,
 * collapses multiple hyphens, and trims leading/trailing hyphens.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanum → hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .replace(/-{2,}/g, "-"); // collapse multiple hyphens
}

/**
 * Generate a unique slug by checking existing slugs in the database.
 * If the base slug exists, appends -2, -3, etc.
 */
export async function generateUniqueSlug(
  base: string,
  existsFn: (slug: string) => Promise<boolean>,
): Promise<string> {
  const slug = slugify(base);
  if (!slug) {
    throw new Error("Cannot generate slug from empty input");
  }
  if (!(await existsFn(slug))) return slug;

  for (let i = 2; i <= 100; i++) {
    const candidate = `${slug}-${i}`;
    if (!(await existsFn(candidate))) return candidate;
  }
  throw new Error("Could not generate unique slug after 100 attempts");
}
