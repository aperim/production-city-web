/**
 * Zod validation schemas for Expression of Interest submissions.
 * Defines per-category metadata validation with discriminated unions.
 */

import { z } from "@hono/zod-openapi";
import { SUPPORTED_LOCALES } from "../i18n/index.js";

/** Valid EOI categories. */
export const EOI_CATEGORIES = [
  "general", "producer", "creative", "partner", "investor", "education", "employment",
] as const;

export type EoiCategory = (typeof EOI_CATEGORIES)[number];

/** Valid EOI statuses. */
export const EOI_STATUSES = ["new", "contacted", "converted", "archived"] as const;

export type EoiStatus = (typeof EOI_STATUSES)[number];

/** Producer-specific metadata fields. */
const ProducerMetadataSchema = z.object({
  company: z.string().max(200).optional(),
  productionType: z.enum(["film", "tv", "commercial", "stage", "music", "other"]).optional(),
  timeline: z.enum(["exploring", "6months", "12months", "24months+"]).optional(),
}).strict();

/** Creative-specific metadata fields. */
const CreativeMetadataSchema = z.object({
  discipline: z.string().max(200).optional(),
  portfolioUrl: z.string().url().max(500)
    .refine((u) => /^https?:\/\//i.test(u), "Must be HTTP or HTTPS")
    .optional(),
}).strict();

/** Partner-specific metadata fields. */
const PartnerMetadataSchema = z.object({
  partnershipArea: z.enum(["technology", "services", "facilities", "other"]).optional(),
  organisation: z.string().max(200).optional(),
}).strict();

/** Investor-specific metadata fields. */
const InvestorMetadataSchema = z.object({
  organisation: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
}).strict();

/** Education-specific metadata fields. */
const EducationMetadataSchema = z.object({
  institution: z.string().max(200).optional(),
  programArea: z.string().max(200).optional(),
}).strict();

/** Employment-specific metadata fields. */
const EmploymentMetadataSchema = z.object({
  desiredRole: z.string().min(1).max(200).transform(escapeHtml).pipe(z.string().trim().min(1, "desiredRole must not be empty after sanitization")),
  experienceLevel: z.enum([
    "entry", "1-3years", "3-5years", "5-10years", "10plus",
  ]).optional(),
  availability: z.enum([
    "immediate", "1-3months", "3-6months", "6plus-months", "flexible",
  ]).optional(),
  portfolioUrl: z.string().url().max(500)
    .refine((u) => /^https?:\/\//i.test(u), "Must be HTTP or HTTPS")
    .optional(),
}).strict();

/** General metadata (empty — no category-specific fields). */
const GeneralMetadataSchema = z.object({}).strict();

/** Maps category to its metadata schema. */
export const CATEGORY_METADATA_SCHEMAS: Record<EoiCategory, z.ZodTypeAny> = {
  general: GeneralMetadataSchema,
  producer: ProducerMetadataSchema,
  creative: CreativeMetadataSchema,
  partner: PartnerMetadataSchema,
  investor: InvestorMetadataSchema,
  education: EducationMetadataSchema,
  employment: EmploymentMetadataSchema,
};

/** Valid source pages (known routes, without locale prefix). */
export const VALID_SOURCE_PAGES = [
  "/", "/facilities", "/creative", "/vision", "/community", "/faq", "/contact",
  "/privacy", "/terms",
] as const;

/** Locale codes that may appear as path prefix (e.g. /es/contact). */
const LOCALE_PREFIXES = ["zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ja"] as const;

/**
 * Check if a path is a known route, optionally with a locale prefix.
 * Accepts: "/", "/contact", "/es/contact", "/ja/facilities"
 */
export function isValidSourcePage(path: string): boolean {
  if ((VALID_SOURCE_PAGES as readonly string[]).includes(path)) return true;
  // Check for locale-prefixed paths
  for (const loc of LOCALE_PREFIXES) {
    const prefix = `/${loc}`;
    if (path === prefix || path === `${prefix}/`) return true;
    if (path.startsWith(`${prefix}/`)) {
      const rest = path.slice(prefix.length);
      if ((VALID_SOURCE_PAGES as readonly string[]).includes(rest)) return true;
    }
  }
  return false;
}

/** UTM parameters schema. */
const UtmSchema = z.object({
  source: z.string().max(200).optional(),
  medium: z.string().max(200).optional(),
  campaign: z.string().max(200).optional(),
}).strict();

/**
 * Escape HTML entities in a string.
 *
 * Replaces the five standard HTML special characters with their entity
 * equivalents. This is strictly safer than the previous tag-stripping regex
 * (`/<[^>]*>/`) which was bypassable via unclosed tags, attribute tricks,
 * and nested constructs (e.g. `<img src=x onerror=alert(1)>`).
 *
 * User input that passes through this function is safe to embed in HTML
 * email bodies without risk of script injection.
 *
 * @see Issue #223 — Finding #27: stripHtml regex replaced with entity escaping
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Full EOI submission request schema.
 * Category-specific metadata is validated after initial parse.
 */
/** Public-facing schema for OpenAPI docs (excludes honeypot field). */
export const EoiSubmissionPublicSchema = z.object({
  category: z.enum(EOI_CATEGORIES),
  name: z.string().min(1).max(200),
  email: z.string().email().max(254),
  message: z.string().max(2000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  sourcePage: z.string().min(1).max(500).refine(isValidSourcePage, "Unknown source page"),
  sourceCategory: z.enum(EOI_CATEGORIES).optional(),
  locale: z.enum(SUPPORTED_LOCALES as unknown as readonly [string, ...string[]]).default("en"),
  utm: UtmSchema.optional(),
  consentVersion: z.string().min(1).max(50),
  privacyAccepted: z.literal(true, {
    message: "Privacy policy consent is required",
  }),
  marketingOptIn: z.boolean().default(false),
});

/** Full runtime schema with honeypot and transforms (not exposed in OpenAPI). */
export const EoiSubmissionSchema = z.object({
  category: z.enum(EOI_CATEGORIES),
  name: z.string().min(1).max(200).transform((v) => escapeHtml(v.trim())),
  email: z.string().email().max(254).transform((v) => v.toLowerCase().trim()),
  message: z.string().max(2000).optional().transform((v) => v ? escapeHtml(v.trim()) : v),
  metadata: z.record(z.string(), z.unknown()).optional(),
  sourcePage: z.string().min(1).max(500).refine(isValidSourcePage, "Unknown source page"),
  sourceCategory: z.enum(EOI_CATEGORIES).optional(),
  locale: z.enum(SUPPORTED_LOCALES as unknown as readonly [string, ...string[]]).default("en"),
  utm: UtmSchema.optional(),
  consentVersion: z.string().min(1).max(50),
  privacyAccepted: z.literal(true, {
    message: "Privacy policy consent is required",
  }),
  marketingOptIn: z.boolean().default(false),
  // Honeypot field — if filled, submission is silently rejected
  website: z.string().max(500).optional(),
});

export type EoiSubmission = z.infer<typeof EoiSubmissionSchema>;

/**
 * Validate category-specific metadata.
 * Returns sanitized metadata as a canonical JSON string, or null.
 */
export function validateMetadata(
  category: EoiCategory,
  metadata: Record<string, unknown> | undefined,
): { valid: true; serialized: string | null } | { valid: false; error: string } {
  if (!metadata || Object.keys(metadata).length === 0) {
    return { valid: true, serialized: null };
  }

  const schema = CATEGORY_METADATA_SCHEMAS[category];
  const result = schema.safeParse(metadata);

  if (!result.success) {
    return { valid: false, error: result.error.issues.map((i) => i.message).join(", ") };
  }

  // Canonical JSON with sorted keys
  const sorted = Object.keys(result.data as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (result.data as Record<string, unknown>)[key];
      return acc;
    }, {});

  return { valid: true, serialized: JSON.stringify(sorted) };
}

/** EOI status update schema (admin). */
export const EoiStatusUpdateSchema = z.object({
  status: z.enum(EOI_STATUSES),
});

/** EOI admin list query schema. */
export const EoiAdminListQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("25"),
  category: z.string().optional(),
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  locale: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});
