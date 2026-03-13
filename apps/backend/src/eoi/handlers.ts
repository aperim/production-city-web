/**
 * Expression of Interest public API handlers.
 * POST /v1/eoi — submit an expression of interest
 * GET /v1/eoi/categories — list available categories with field schemas
 * GET /v1/locales — list supported locales
 */

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createPrismaClient } from "../lib/prisma.js";
import { t, LOCALE_META, isSupportedLocale } from "../i18n/index.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.js";
import {
  EoiSubmissionSchema,
  EoiSubmissionPublicSchema,
  validateMetadata,
  EOI_CATEGORIES,
  CATEGORY_METADATA_SCHEMAS,
} from "./validation.js";
import { sendEmail } from "../email/postmark.js";
import { isEmailSuppressed } from "../email/service.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  POSTMARK_API_TOKEN: string;
};

export const eoiApp = new OpenAPIHono<{ Bindings: Bindings }>();

/** Sender address for transactional emails. */
const FROM_ADDRESS = "Production City <noreply@mail.production.city>";

// --- Rate limiting ---

// Per-IP rate limit: 10 submissions per hour
eoiApp.use(
  "/v1/eoi",
  rateLimitMiddleware({
    keyFn: (c) => `eoi-ip:${c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown"}`,
    limit: 10,
    windowSeconds: 3600,
  }),
);

// --- Schemas ---

const EoiResponseSchema = z.object({
  id: z.string(),
  message: z.string(),
});

const EoiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.array(z.string())).optional(),
});

const CategoriesResponseSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      fields: z.array(
        z.object({
          name: z.string(),
          type: z.enum(["text", "select", "url"]),
          required: z.boolean(),
          options: z.array(z.string()).optional(),
        }),
      ),
    }),
  ),
});

const LocalesResponseSchema = z.object({
  locales: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      nativeName: z.string(),
      direction: z.enum(["ltr", "rtl"]),
    }),
  ),
});

// --- Routes ---

const submitEoiRoute = createRoute({
  method: "post",
  path: "/v1/eoi",
  summary: "Submit an expression of interest",
  description: "Public endpoint for submitting expressions of interest. No authentication required.",
  request: {
    body: { content: { "application/json": { schema: EoiSubmissionPublicSchema } } },
  },
  responses: {
    201: {
      content: { "application/json": { schema: EoiResponseSchema } },
      description: "EOI created successfully",
    },
    400: {
      content: { "application/json": { schema: EoiErrorSchema } },
      description: "Validation error",
    },
    429: {
      content: { "application/json": { schema: EoiErrorSchema } },
      description: "Rate limited",
    },
  },
});

const categoriesRoute = createRoute({
  method: "get",
  path: "/v1/eoi/categories",
  summary: "List EOI categories with field schemas",
  description: "Returns available expression of interest categories with their required and optional fields.",
  responses: {
    200: {
      content: { "application/json": { schema: CategoriesResponseSchema } },
      description: "Categories listed",
    },
  },
});

const localesRoute = createRoute({
  method: "get",
  path: "/v1/locales",
  summary: "List supported locales",
  description: "Returns all supported locales with their names and text direction.",
  responses: {
    200: {
      content: { "application/json": { schema: LocalesResponseSchema } },
      description: "Locales listed",
    },
  },
});

// --- Handlers ---

eoiApp.openapi(submitEoiRoute, async (c) => {
  const parsed = EoiSubmissionSchema.safeParse(await c.req.json());

  if (!parsed.success) {
    const details: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    }
    return c.json(
      { error: "validation_error", message: t("errors.invalidInput", undefined, "en"), details },
      400,
    );
  }

  const data = parsed.data;
  const locale = data.locale;

  // Honeypot check — before rate limit per review findings
  if (data.website) {
    return c.json(
      { error: "validation_error", message: t("eoi.honeypotRejected", undefined, locale) },
      400,
    );
  }

  // Validate category-specific metadata
  const metadataResult = validateMetadata(data.category, data.metadata as Record<string, unknown> | undefined);
  if (!metadataResult.valid) {
    return c.json(
      { error: "validation_error", message: metadataResult.error, details: { metadata: [metadataResult.error] } },
      400,
    );
  }

  const prisma = await createPrismaClient(c.env.DB);

  try {
    // Per-email rate limit: 3 submissions per 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const emailCount = await prisma.expressionOfInterest.count({
      where: {
        email: data.email,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (emailCount >= 3) {
      c.header("Retry-After", "3600");
      c.header("X-RateLimit-Limit", "3");
      c.header("X-RateLimit-Remaining", "0");
      return c.json(
        { error: "rate_limited", message: t("errors.rateLimited", undefined, locale) },
        429,
      );
    }

    // Create EOI record
    const eoi = await prisma.expressionOfInterest.create({
      data: {
        category: data.category,
        name: data.name,
        email: data.email,
        message: data.message ?? null,
        metadata: metadataResult.serialized,
        sourcePage: data.sourcePage,
        sourceCategory: data.sourceCategory ?? null,
        locale,
        utmSource: data.utm?.source ?? null,
        utmMedium: data.utm?.medium ?? null,
        utmCampaign: data.utm?.campaign ?? null,
        consentVersion: data.consentVersion,
        privacyAcceptedAt: new Date(),
        marketingOptIn: data.marketingOptIn,
      },
    });

    // Send confirmation email (don't fail submission if email fails)
    try {
      const suppressed = await isEmailSuppressed(prisma, data.email);
      if (!suppressed && c.env.POSTMARK_API_TOKEN) {
        const subject = t("eoi.confirmationSubject", undefined, locale);
        const bodyText = t("eoi.confirmationBody", undefined, locale);

        const result = await sendEmail(c.env.POSTMARK_API_TOKEN, {
          From: FROM_ADDRESS,
          To: data.email,
          Subject: subject,
          HtmlBody: `<p>${bodyText}</p>`,
          TextBody: bodyText,
          MessageStream: "outbound",
          Tag: "eoi-confirmation",
        });

        if (result.ok) {
          await prisma.expressionOfInterest.update({
            where: { id: eoi.id },
            data: {
              confirmationSentAt: new Date(),
              postmarkMessageId: result.data.MessageID,
            },
          });
        }
      }
    } catch (emailErr) {
      console.error(JSON.stringify({
        event: "eoi.confirmation.failed",
        eoiId: eoi.id,
        error: String(emailErr),
      }));
    }

    // Log structured event
    console.log(JSON.stringify({
      event: "eoi.submitted",
      eoiId: eoi.id,
      category: data.category,
      locale,
      sourcePage: data.sourcePage,
    }));

    return c.json(
      { id: eoi.id, message: t("eoi.submitted", undefined, locale) },
      201,
    );
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

eoiApp.openapi(categoriesRoute, (c) => {
  const locale = c.req.query("locale") ?? "en";

  const categories = EOI_CATEGORIES.map((cat) => {
    const schema = CATEGORY_METADATA_SCHEMAS[cat];
    const shape = (schema as z.ZodObject<z.ZodRawShape>)._def?.shape ?? {};

    const fields = Object.entries(shape).map(([name, fieldSchema]) => {
      const zodField = fieldSchema as z.ZodTypeAny;
      const zodDef = (zodField as unknown as { _zod?: { def?: Record<string, unknown> } })._zod?.def;
      const isEnum = zodDef?.type === "enum";
      const isUrl = zodDef?.format === "url";

      return {
        name,
        type: isUrl ? "url" as const : isEnum ? "select" as const : "text" as const,
        required: !zodField.isOptional(),
        ...(isEnum ? { options: Object.values((zodDef?.entries ?? {}) as Record<string, string>) } : {}),
      };
    });

    const localeKey = `eoi.category${cat.charAt(0).toUpperCase() + cat.slice(1)}` as Parameters<typeof t>[0];

    return {
      id: cat,
      name: t(localeKey, undefined, isSupportedLocale(locale) ? locale : "en"),
      fields,
    };
  });

  c.header("Cache-Control", "public, max-age=3600");
  return c.json({ categories }, 200);
});

eoiApp.openapi(localesRoute, (c) => {
  c.header("Cache-Control", "public, max-age=86400");
  return c.json({ locales: [...LOCALE_META] }, 200);
});
