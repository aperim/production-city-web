/**
 * apps/web custom worker entry — wraps the vinext app-router handler and
 * injects HTTP security response headers on every response.
 *
 * Also implements:
 * - www.production.city → production.city 308 redirect (Issue #97)
 * - Locale middleware: URL prefix routing (Issue #277)
 *
 * @see Issue #45
 * @see Issue #97
 * @see Issue #277
 */
import handler from "vinext/server/app-router-entry";
import { isSupportedLocale } from "../../../packages/ui/src/lib/i18n-constants.js";
import {
  parseLocalePrefix,
  shouldBypassLocaleMiddleware,
  parseAcceptLanguage,
  normalizeTrailingSlash,
  buildRedirectUrl,
  validateCookieLocale,
  sanitizeInvalidLocale,
} from "./locale-middleware.js";
import { handleLegacyRedirect } from "./legacy-redirects.js";
import { buildCsp } from "./csp.js";

/** Canonical production hostname. */
const CANONICAL_HOST = "production.city";

/** www hostname that redirects to canonical. */
const WWW_HOST = `www.${CANONICAL_HOST}`;

/**
 * Get the canonical origin for redirect URLs.
 * Uses request Host header for dev/preview environments (Finding #10).
 */
function getCanonicalOrigin(url: URL): string {
  const isDev = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (isDev) {
    return `${url.protocol}//${url.host}`;
  }
  return `https://${CANONICAL_HOST}`;
}

/**
 * Security headers applied to every response (CSP set dynamically).
 * HSTS is also set here as defence-in-depth; Cloudflare edge enforces it
 * independently via SSL/TLS → Edge Certificates → HSTS settings (PRO-353).
 */
const STATIC_SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), " +
    "magnetometer=(), gyroscope=(), accelerometer=()",
};

/**
 * Parse a cookie value from the Cookie header.
 */
function getCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("Cookie");
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]!);
  } catch {
    return null;
  }
}

/**
 * Apply security headers to a response.
 */
function applySecurityHeaders(response: Response, hostname: string, pathname?: string): Response {
  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(STATIC_SECURITY_HEADERS)) {
    newResponse.headers.set(key, value);
  }
  newResponse.headers.set("Content-Security-Policy", buildCsp(hostname));

  // Issue #352: suppress search engine indexing for /dashboard/** routes
  if (pathname && (pathname === "/dashboard" || pathname.startsWith("/dashboard/"))) {
    newResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return newResponse;
}

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. www → canonical redirect (Issue #97).
    if (url.hostname === WWW_HOST) {
      url.protocol = "https:";
      url.hostname = CANONICAL_HOST;
      url.port = "";
      url.username = "";
      url.password = "";
      return Response.redirect(url.toString(), 308);
    }

    // 2. Legacy dashboard route redirects (Issue #349).
    const legacyRedirect = handleLegacyRedirect(url);
    if (legacyRedirect) return legacyRedirect;

    // 3. Bypass locale middleware for API, auth, static, machine endpoints (Finding #8).
    if (shouldBypassLocaleMiddleware(url.pathname)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vinext handler types are opaque
      const response = await (handler as any).fetch(request, env, ctx);
      return applySecurityHeaders(response, url.hostname, url.pathname);
    }

    const canonicalOrigin = getCanonicalOrigin(url);

    // 3. Strip pre-existing internal headers FIRST (Finding #5 — spoofing prevention).
    const headers = new Headers(request.headers);
    headers.delete("X-Locale");
    headers.delete("X-Path");
    headers.delete("X-Query");

    // 4. Parse locale prefix.
    const parsed = parseLocalePrefix(url.pathname);
    let locale = "en";
    let forwardPath = url.pathname;

    if (parsed) {
      // Handle /en/ → redirect to / (English has no prefix)
      if (parsed.locale === "en") {
        const target = parsed.remainingPath + url.search;
        try {
          const redirectUrl = buildRedirectUrl(target, canonicalOrigin);
          const redirectResponse = new Response(null, {
            status: 302,
            headers: {
              "Location": redirectUrl,
              "Cache-Control": "no-cache",
            },
          });
          return applySecurityHeaders(redirectResponse, url.hostname);
        } catch {
          // If path validation fails, redirect to root
          return applySecurityHeaders(
            Response.redirect(canonicalOrigin + "/", 302),
            url.hostname,
          );
        }
      }

      if (isSupportedLocale(parsed.locale)) {
        locale = parsed.locale;
        forwardPath = parsed.remainingPath;

        // Check trailing slash normalization for locale paths.
        // Single redirect rule: handle case normalization + trailing slash in one redirect (Finding #12).
        const originalFirstSegment = url.pathname.match(/^\/([^/]+)/)?.[1] ?? "";
        const needsCaseNormalization = originalFirstSegment !== parsed.locale;

        const slashResult = normalizeTrailingSlash(url.pathname, parsed.locale);
        if (slashResult || needsCaseNormalization) {
          // Build normalized path
          let normalizedPath: string;
          if (slashResult) {
            // Use the trailing-slash-normalized result, but ensure locale is lowercase
            normalizedPath = slashResult.redirect.replace(
              new RegExp(`^/${originalFirstSegment}`, "i"),
              `/${parsed.locale}`,
            );
          } else {
            // Only case normalization needed
            normalizedPath = url.pathname.replace(
              new RegExp(`^/${originalFirstSegment}`),
              `/${parsed.locale}`,
            );
          }

          try {
            const redirectUrl = buildRedirectUrl(normalizedPath + url.search, canonicalOrigin);
            const redirectResponse = new Response(null, {
              status: 301,
              headers: { "Location": redirectUrl },
            });
            return applySecurityHeaders(redirectResponse, url.hostname);
          } catch {
            return applySecurityHeaders(
              Response.redirect(canonicalOrigin + "/", 302),
              url.hostname,
            );
          }
        }
      } else {
        // Invalid locale prefix → 302 redirect to English path (Finding #11)
        // Log sanitized metadata only (Finding #14)
        console.info(`invalid locale seen: hash=${sanitizeInvalidLocale(parsed.locale)}`);

        const target = parsed.remainingPath + url.search;
        try {
          const redirectUrl = buildRedirectUrl(target, canonicalOrigin);
          const redirectResponse = new Response(null, {
            status: 302,
            headers: {
              "Location": redirectUrl,
              "Cache-Control": "no-cache",
            },
          });
          return applySecurityHeaders(redirectResponse, url.hostname);
        } catch {
          return applySecurityHeaders(
            Response.redirect(canonicalOrigin + "/", 302),
            url.hostname,
          );
        }
      }
    } else {
      // No locale prefix — check trailing slash on English paths
      const slashResult = normalizeTrailingSlash(url.pathname, null);
      if (slashResult) {
        try {
          const redirectUrl = buildRedirectUrl(slashResult.redirect + url.search, canonicalOrigin);
          const redirectResponse = new Response(null, {
            status: 301,
            headers: { "Location": redirectUrl },
          });
          return applySecurityHeaders(redirectResponse, url.hostname);
        } catch {
          // path validation failed
        }
      }

      // Check pc-locale cookie for returning visitor server-side redirect (Finding #2)
      if (url.pathname === "/") {
        const pcLocale = validateCookieLocale(getCookie(request, "pc-locale"));
        if (pcLocale && pcLocale !== "en") {
          try {
            const redirectUrl = buildRedirectUrl(`/${pcLocale}/`, canonicalOrigin);
            const redirectResponse = new Response(null, {
              status: 302,
              headers: {
                "Location": redirectUrl,
                "Cache-Control": "no-cache",
              },
            });
            return applySecurityHeaders(redirectResponse, url.hostname);
          } catch {
            // path validation failed, continue without redirect
          }
        }
      }
    }

    // 5. Hidden page redirects — temporarily redirect pages with incomplete content (PRO-261).
    if (forwardPath === "/company/team" || forwardPath === "/company/team/") {
      const target = locale === "en" ? "/company" : `/${locale}/company`;
      try {
        const redirectUrl = buildRedirectUrl(target, canonicalOrigin);
        return applySecurityHeaders(
          new Response(null, { status: 302, headers: { Location: redirectUrl, "Cache-Control": "no-cache" } }),
          url.hostname,
        );
      } catch {
        return applySecurityHeaders(Response.redirect(canonicalOrigin + "/", 302), url.hostname);
      }
    }

    // 6. Set X-Locale, X-Path, and X-Query headers on forwarded request.
    headers.set("X-Locale", locale);
    headers.set("X-Path", forwardPath);
    headers.set("X-Query", url.search);

    // Build the forwarded request with the stripped path (no locale prefix).
    const forwardUrl = new URL(forwardPath + url.search, url.origin);
    const forwardRequest = new Request(forwardUrl.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: request.redirect,
    });

    // 7. Forward to vinext handler.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- vinext handler types are opaque
    const response = await (handler as any).fetch(forwardRequest, env, ctx);
    const newResponse = applySecurityHeaders(response, url.hostname, forwardPath);

    // 8. Set Content-Language response header.
    newResponse.headers.set("Content-Language", locale);

    // 9. Set Vary header on HTML responses (Finding #1).
    const contentType = newResponse.headers.get("Content-Type") ?? "";
    if (contentType.includes("text/html")) {
      newResponse.headers.set("Vary", "Accept-Language, Cookie");
    }

    // 10. First-visit detection: set pc-locale-suggestion cookie (Finding #7, #9).
    if (locale === "en" && url.pathname === "/") {
      const suggestion = parseAcceptLanguage(request.headers.get("Accept-Language"));
      if (suggestion) {
        newResponse.headers.append(
          "Set-Cookie",
          `pc-locale-suggestion=${suggestion}; SameSite=Lax; Secure; Path=/; Max-Age=604800`,
        );
        // Cache-Control for responses that conditionally set cookies (Finding #1)
        newResponse.headers.set("Cache-Control", "private, no-store");
      }
    }

    return newResponse;
  },
} satisfies ExportedHandler;
