# Design: i18n Completeness — Routing, SEO, RTL, Translations & Intl Formatting

**Date:** 2026-03-15
**Approach:** Worker-level prefix routing with server-resolved locale
**Supersedes:** Issues #221, #222

---

## Context

Production City has a custom, lightweight i18n system supporting 10 locales (en, zh, hi, es, ar, fr, bn, pt, ru, ja). The system works for client-side locale switching but has critical gaps in SEO, server-side routing, and best-practice compliance. This epic closes those gaps and consumes blocking issues #221 and #222.

### Current State

- **Working:** Type-safe translation keys, lazy-loading locale bundles, RTL CSS logical properties, LanguageSwitcher with keyboard/ARIA support, quality-gate tests enforcing key parity, backend Accept-Language parsing
- **Missing:** URL-based locale routing, `Content-Language` header, `hreflang` alternate links, server-resolved `<html lang>`, Intl.* formatting, bidi-isolation for mixed-direction content, pluralization, XML sitemap locale variants, canonical URLs per locale

### Gaps Summary

| Gap | SEO Impact | UX Impact |
|-----|-----------|-----------|
| No URL-based locale routing | Critical — search engines can't index locale variants | Users can't share/bookmark locale-specific URLs |
| No `hreflang` links | Critical — Google can't discover alternate-language pages | None directly |
| No `Content-Language` header | Moderate — proxy/crawler signal missing | None directly |
| Static `<html lang="en">` | Moderate — screen readers + crawlers see wrong language until hydration | FOUC for non-English |
| No `Intl.*` formatting | None currently | Prevents future locale-aware display |
| No bidi-isolation | None | Arabic UX — phone numbers, URLs render incorrectly in RTL context |
| No pluralization | None | Incorrect grammar in Arabic (6 forms), Russian (3), French (2) |
| No sitemap locale variants | Moderate — crawlers miss alternate-language pages | None |

---

## Architecture

### Locale Resolution Order

```
1. URL prefix: /{locale}/path  (authoritative — if present, use it)
2. localStorage: pc-locale     (returning user preference)
3. Accept-Language header       (browser/OS language)
4. Fallback: "en"              (default)
```

English is the default locale and lives at `/` with no `/en/` prefix. All other locales use `/{locale}/` prefix (e.g., `/zh/`, `/ar/facilities`).

### Trailing Slash Normalization

All locale-prefixed paths use a **trailing slash on the locale segment only**: `/zh/facilities` (not `/zh/facilities/`). The root locale path is `/zh/` (trailing slash required to distinguish from a page named `/zh`).

Worker normalization rules:
- `/zh` → 301 to `/zh/` (locale root needs trailing slash)
- `/zh/facilities/` → 301 to `/zh/facilities` (strip trailing slash on sub-paths)
- `/facilities/` → 301 to `/facilities` (strip trailing slash on English paths too)

This prevents duplicate content SEO issues and ensures canonical URLs are consistent.

### Worker-Level Rewrite Flow

The existing Worker (`apps/web/worker/index.ts`) handles `www` redirect and security headers (CSP, X-Content-Type-Options, X-Frame-Options). Locale middleware integrates into this existing pipeline:

```
Browser request: GET /zh/facilities
    │
    ▼
┌─────────────────────────────────────────────────┐
│ Cloudflare Worker (worker/index.ts)              │
│                                                  │
│ EXISTING (unchanged):                            │
│   1. www → canonical redirect                    │
│   2. Security headers (CSP, X-Frame-Options)     │
│                                                  │
│ NEW (locale middleware, runs AFTER www redirect): │
│   3. Normalize trailing slashes (301 if needed)  │
│   4. Parse first path segment                    │
│   5. If valid locale: strip prefix, continue     │
│   6. If invalid 2-letter segment: 302 → /path   │
│   7. Strip any pre-existing X-Locale header      │
│      from incoming request (prevent spoofing)    │
│   8. Set X-Locale: zh on forwarded request       │
│   9. Forward to vinext handler.fetch()           │
│  10. Set Content-Language: zh on response        │
│  11. Set pc-locale-suggestion cookie if needed   │
│                                                  │
│ Integration: locale middleware wraps the existing│
│ handler.fetch() call, not the security headers.  │
│ Security headers are applied to all responses    │
│ including locale redirects.                      │
└─────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ vinext (apps/web)               │
│                                 │
│ 1. Read X-Locale header         │
│ 2. Render page with locale=zh   │
│ 3. <html lang="zh" dir="ltr">   │
│ 4. <link rel="alternate" ...>   │
│ 5. Content-Language: zh header  │
└─────────────────────────────────┘
    │
    ▼
Browser receives: HTML with lang="zh", Content-Language: zh,
                  hreflang links, Chinese content
```

**Security: X-Locale header spoofing prevention.** The Worker MUST delete any pre-existing `X-Locale` header from the incoming client request before setting its own value. This prevents an attacker from injecting an arbitrary locale value that bypasses Worker validation. The vinext app trusts `X-Locale` as authoritative — it must only come from the Worker.

### First-Visit Auto-Detection

When a user visits `/` (no locale prefix, no localStorage preference):

1. Worker reads `Accept-Language` header
2. If best match is non-English and confidence > 0.5 → **do not redirect** (avoid surprising users)
3. Instead, serve English content but set a `pc-locale-suggestion` cookie with the detected locale value. Cookie attributes: `SameSite=Lax; Secure; Path=/; Max-Age=604800` (7 days). NOT `HttpOnly` — client-side JS needs to read it for the suggestion prompt
4. LanguageSwitcher can show a "View in [Language]?" prompt using the cookie value
5. If user accepts, navigate to `/{locale}/` and set `pc-locale` in localStorage

**Rationale:** Auto-redirecting based on Accept-Language is a common anti-pattern. Users behind VPNs, on shared devices, or with misconfigured browsers get sent to the wrong locale with no obvious way back. A suggestion prompt is the established best practice (Google, MDN, Stripe all use this pattern).

### Invalid Locale Handling

- `/{invalid}/path` → 302 redirect to canonical English URL (strip invalid prefix)
- `/{valid-but-unsupported}/path` (e.g., `/de/`) → same behavior, 302 redirect
- Worker logs the invalid locale for analytics (potential new locale demand)
- 302 (not 301) is intentional: allows adding new locales without cache invalidation

**Security: Open redirect prevention.** The redirect target MUST be constructed as an absolute URL using the canonical host (`production.city`), not by naively stripping the prefix from the request URL. The Worker must:
1. Extract the path portion after the invalid locale segment
2. Validate it contains no authority component (`//`, `@`)
3. Construct the redirect as `https://production.city/{validated-path}`
4. Never reflect attacker-controlled content in the `Location` header without validation

---

## Phase 1: Infrastructure & Routing (Omnibus PR)

### Deliverables

1. **Worker locale middleware** (`apps/web/worker/index.ts`)
   - Parse `/{locale}/` prefix from request URL
   - Validate against `SUPPORTED_LOCALES` constant (shared between worker and app)
   - Strip prefix, set `X-Locale` request header, forward to vinext
   - Set `Content-Language` response header on all responses
   - Handle invalid locale → 302 redirect
   - First-visit detection: set `pc-locale-suggestion` cookie from Accept-Language

2. **Server-resolved `<html lang>` and `dir`** (`apps/web/app/layout.tsx`)
   - Read locale from request context (vinext server-side)
   - Render `<html lang="{locale}" dir="{direction}">` server-side
   - Remove client-side `document.documentElement.lang` mutation (no longer needed)

3. **`LocaleHead` component** (`apps/web/app/components/LocaleHead.tsx`)
   - Lives in `apps/web` (not `packages/ui`) because it requires routing context (current URL, canonical host) — a pure UI atom should not know about URL structure
   - Props: `currentPath: string`, `currentLocale: SupportedLocale`, `canonicalHost: string` — all routing knowledge injected via props
   - Renders `<link rel="alternate" hreflang="{locale}" href="{url}">` for all 10 locales
   - Renders `<link rel="alternate" hreflang="x-default" href="{english-url}">`
   - Renders `<link rel="canonical" href="{current-locale-url}">`
   - No Storybook story (not a reusable UI component — it's app-specific head metadata)

4. **`Intl.*` formatting utilities** (`packages/ui/src/lib/i18n-format.ts`)
   - Lives in `packages/ui` alongside `i18n-constants.ts` so both app and UI components can use formatters
   - `formatDate(date, locale, options?)` — wraps `Intl.DateTimeFormat`
   - `formatNumber(num, locale, options?)` — wraps `Intl.NumberFormat`
   - `formatCurrency(amount, currency, locale)` — wraps `Intl.NumberFormat` with currency style
   - `formatRelativeTime(value, unit, locale)` — wraps `Intl.RelativeTimeFormat`
   - All return strings, all accept locale parameter, all fall back to `"en"` on error

5. **Locale sub-tag fallback** (`apps/web/app/i18n/index.ts`)
   - Enhanced `detectBrowserLocale()`: `pt-BR` → `pt`, `zh-Hans` → `zh`, `en-US` → `en`
   - Proper BCP 47 sub-tag resolution (language-script-region hierarchy)

6. **Shared locale constants** (new: `packages/ui/src/lib/i18n-constants.ts`)
   - `SUPPORTED_LOCALES`, `LOCALE_META`, `isSupportedLocale()`, `getDirection()`
   - Shared between Worker, app, and UI components — single source of truth
   - Currently duplicated between `apps/web/app/i18n/index.ts` and `apps/backend/src/i18n/index.ts`

7. **I18nProvider update** (`apps/web/app/i18n/context.tsx`)
   - Accept `serverLocale` prop (from Worker `X-Locale` header) as initial value
   - Remove client-side `detectBrowserLocale()` on initial render (server already resolved it)
   - Keep `setLocale()` for client-side switching via LanguageSwitcher (navigates to new URL)

### TDD Plan (Phase 1)

**Unit tests (Vitest) — write BEFORE implementation:**

| Test file | Tests |
|-----------|-------|
| `worker/locale-middleware.test.ts` | Strips `/zh/` prefix → forwards `/` with `X-Locale: zh`; strips `/ar/facilities` → forwards `/facilities` with `X-Locale: ar`; no prefix → no `X-Locale` header (defaults to `en`); invalid prefix `/xx/` → 302 to absolute canonical URL; English prefix `/en/` → 302 to `/` (English has no prefix); sets `Content-Language` response header matching resolved locale; first-visit Accept-Language `zh` → sets `pc-locale-suggestion=zh` cookie with correct attributes (SameSite, Secure, Path, Max-Age); strips pre-existing `X-Locale` header from client request; redirect target never contains authority component from attacker input; trailing slash normalization: `/zh` → 301 `/zh/`, `/zh/facilities/` → 301 `/zh/facilities` |
| `i18n/format.test.ts` | `formatDate` returns locale-appropriate date string for each supported locale; `formatNumber` handles thousands separators per locale; `formatCurrency` shows correct currency symbol and format; `formatRelativeTime` produces "3 days ago" equivalents per locale; all formatters fall back to `en` on invalid locale |
| `i18n/subtag-fallback.test.ts` | `pt-BR` → `pt`; `zh-Hans-CN` → `zh`; `en-US` → `en`; `ar-EG` → `ar`; `de` → `null` (unsupported); `invalid` → `null` |
| `LocaleHead.test.tsx` | Renders 10 `<link rel="alternate">` tags + 1 `x-default`; `href` values use correct locale prefix; canonical link matches current locale URL; handles pages with query params; handles trailing slashes consistently |

### Peer Review Requirements (Phase 1)

- Claude Code self-review before PR
- Codex MCP security review (Worker header injection, redirect open-redirect risk, cookie security)
- Codex MCP blind-spot review

---

## Phase 2: Translation Quality & RTL Polish (Omnibus PR)

### Deliverables

1. **Professional translation review**
   - Audit all 9 non-English locale files against en.json source of truth
   - Fix mistranslations, awkward phrasing, register mismatches
   - Cultural adaptation: French `vous`, Japanese polite forms, Arabic MSA, Spanish neutral Latin American, Portuguese Brazilian
   - "Production City" remains untranslated (brand name) in all locales

2. **Pluralization support**
   - Add plural rule engine to `t()` function
   - Support ICU-style plural syntax: `{count, plural, =0 {none} one {# item} other {# items}}`
   - Arabic: 6 plural forms (zero, one, two, few, many, other)
   - Russian: 3 forms (one, few, other)
   - French/Spanish/Portuguese: 2 forms (one, other)
   - English: 2 forms (one, other)
   - Add plural keys to translation files where needed

3. **`BidiIsolate` component** (`packages/ui/src/atoms/BidiIsolate/`)
   - Wraps mixed-direction content with `<bdi>` HTML element
   - Use cases: phone numbers, email addresses, URLs, brand names within Arabic RTL text
   - Props: `children`, optional `dir` override
   - Storybook stories: LTR content in RTL context, phone number, URL, brand name

4. **Arabic RTL bidi-isolation audit**
   - Scan all pages for hardcoded LTR content (phone numbers, emails, URLs, "Production City")
   - Wrap with `<BidiIsolate>` component
   - Verify no visual corruption in RTL layout

5. **Font loading verification**
   - Confirm font stack handles all scripts: Latin, CJK, Devanagari, Bengali, Arabic, Cyrillic
   - **Noto Sans is NOT pre-installed on Windows, macOS, or iOS** — only reliably available on Android/ChromeOS. Expect that web font `@font-face` declarations WILL be needed for CJK, Devanagari, Bengali, and Arabic on Western-configured desktops
   - Test on actual OS font stacks (macOS Safari, Windows Chrome, iOS Safari) and identify fallback glyph rendering
   - Add targeted `@font-face` declarations for any script that falls back to generic glyphs
   - Use `unicode-range` subsetting to minimize payload — only load character ranges actually used in translations
   - Budget constraint: total web font payload must not exceed 500KB

6. **LanguageSwitcher URL awareness** (`packages/ui/src/molecules/LanguageSwitcher/`)
   - Add `currentPath` prop to generate locale-prefixed navigation URLs
   - On language switch: navigate to `/{newLocale}/{currentPath}` instead of just calling `setLocale()`
   - Preserve query parameters and hash fragments
   - Update Storybook stories with URL-aware variants

### TDD Plan (Phase 2)

**Unit tests (Vitest) — write BEFORE implementation:**

| Test file | Tests |
|-----------|-------|
| `i18n/pluralization.test.ts` | English: 0 → "other", 1 → "one", 2 → "other"; Arabic: 0 → "zero", 1 → "one", 2 → "two", 3 → "few", 11 → "many", 100 → "other"; Russian: 1 → "one", 2 → "few", 5 → "other"; French: 0 → "one", 1 → "one", 2 → "other" (**note: French treats 0 as singular per CLDR rules — this differs from English where 0 is "other"**); fallback: missing plural form → "other" |
| `BidiIsolate.test.tsx` | Renders `<bdi>` element wrapping children; applies `dir` attribute when specified; renders inline (no layout disruption) |
| `LanguageSwitcher-url.test.tsx` | Generates `/zh/facilities` when switching to zh on `/facilities`; preserves `?query=1#hash`; generates `/` (no prefix) when switching to English; handles root path `/` → `/zh/` |
| `i18n/translation-quality.test.ts` | All plural keys have correct number of forms per locale; no ICU syntax errors in translation values; interpolation placeholders preserved across all locales |

### Peer Review Requirements (Phase 2)

- Claude Code translation quality review (spot-check 5 keys per locale for cultural accuracy)
- Codex MCP review (pluralization edge cases, bidi-isolation completeness)

---

## Phase 3: SEO, Verification & Documentation (Omnibus PR)

### Deliverables

1. **XML sitemap with locale variants** (build-time generation)
   - Generate sitemap entries for all pages × all locales
   - Each URL includes `<xhtml:link rel="alternate" hreflang="{locale}" href="{url}">` for all 10 locales
   - Include `x-default` pointing to English URL
   - **Build-time generation** (not dynamic Worker-served): the page list is static (7 pages), so a build script produces `sitemap.xml` as a static asset. This is simpler and more cacheable than dynamic generation
   - The build script lives in `apps/web/scripts/generate-sitemap.ts` and runs as part of `pnpm --filter ./apps/web build`

2. **`robots.txt` update**
   - Add `Sitemap: https://production.city/sitemap.xml` directive
   - Ensure `robots.txt` is served as a static asset from the Worker

3. **Full rendering verification**
   - 10 locales × 7 pages = 70 page renders
   - Assert: no untranslated keys visible (no dot-notation key strings in output)
   - Assert: `<html lang>` matches locale, `dir` correct for each
   - Assert: `Content-Language` header matches
   - Assert: hreflang links present and correct

4. **E2E test suite** (enable skipped tests + new coverage)
   - Enable all currently-skipped i18n E2E tests in `i18n.spec.ts`
   - Add: visit `/{locale}/` for each supported locale → correct content
   - Add: LanguageSwitcher navigation preserves path
   - Add: invalid locale redirect
   - Add: Arabic RTL layout verification (bidi-isolation, logical properties)
   - Add: hreflang link verification
   - Add: Content-Language header verification

5. **OpenAPI documentation updates**
   - Document `Content-Language` response header on all endpoints
   - Document `Accept-Language` request header handling
   - Document locale-prefixed URL routing behavior

6. **Knowledge documentation updates**
   - Add i18n routing pattern to CLAUDE.md
   - Document locale resolution order and Worker-rewrite architecture
   - Document pluralization syntax and Intl formatting utilities
   - Update `docs/knowledge/frontend-2026.md` if any i18n-relevant framework changes

7. **Locale suggestion prompt**
   - Small banner/toast when `pc-locale-suggestion` cookie is set and differs from current locale
   - "This page is available in [Language Name]. Switch?" with dismiss
   - Dismissing sets a `pc-locale-dismissed` cookie (`SameSite=Lax; Secure; Path=/; Max-Age=31536000` — 1 year) to prevent re-prompting
   - Component: `LocaleSuggestion` molecule in `packages/ui` — Storybook stories for visible prompt, dismissed state, RTL variant

### TDD Plan (Phase 3)

**Unit tests (Vitest):**

| Test file | Tests |
|-----------|-------|
| `sitemap/locale-sitemap.test.ts` | Sitemap includes all 7 pages × 10 locales; each entry has correct hreflang alternates; x-default points to English URL; URLs are absolute with correct domain |
| `LocaleSuggestion.test.tsx` | Shows prompt when `pc-locale-suggestion` cookie is set and differs from current locale; does not show when cookie matches current locale; does not show when `pc-locale-dismissed` cookie is set; dismiss sets `pc-locale-dismissed` cookie with correct attributes; accept navigates to `/{locale}/`; renders correctly in RTL context |

**E2E tests (Playwright):**

| Test file | Tests |
|-----------|-------|
| `e2e/landing/i18n.spec.ts` | 10 locales × 7 pages render without untranslated keys; Arabic pages have `dir="rtl"`; LanguageSwitcher navigates to `/{locale}/{path}`; invalid locale `/xx/` redirects to `/`; hreflang links in `<head>` for all pages; Content-Language header matches locale; bidi-isolated content renders correctly in Arabic; locale suggestion prompt appears for non-English Accept-Language; locale suggestion dismiss persists across page loads |
| `e2e/landing/sitemap.spec.ts` | Sitemap accessible at `/sitemap.xml`; contains locale alternate links; all URLs are valid and return 200; `robots.txt` contains `Sitemap:` directive |

### Peer Review Requirements (Phase 3)

- Claude Code self-review (SEO completeness, E2E coverage)
- Codex MCP security review (sitemap generation, redirect chains)
- Codex MCP blind-spot review (missed SEO signals, accessibility gaps)

---

## User Happy Path

1. **New visitor (English browser):** Visits `production.city` → English content, `lang="en"`, `dir="ltr"`, no redirect
2. **New visitor (Chinese browser):** Visits `production.city` → English content served, locale suggestion prompt shows "View in Chinese?" → user clicks → navigates to `/zh/`, `lang="zh"`, Chinese content
3. **Returning visitor:** Visits `production.city` → client-side JS reads `pc-locale=ar` from localStorage → client-side redirect to `/ar/` (Worker cannot read localStorage, so this is a JS-initiated navigation on page load, before meaningful content renders)
4. **Direct locale URL:** Visits `production.city/ar/facilities` → Arabic content, `lang="ar"`, `dir="rtl"`, RTL layout, bidi-isolated phone numbers
5. **Language switch:** On `/zh/facilities`, clicks LanguageSwitcher → selects Japanese → navigates to `/ja/facilities`, content updates, `lang="ja"`
6. **Shared link:** User shares `production.city/es/contact` → recipient sees Spanish contact page directly
7. **Search engine:** Google crawls hreflang links → indexes all 10 variants → shows correct version per searcher language
8. **Invalid locale:** Visits `production.city/de/facilities` → 302 redirect to `/facilities` (English)

---

## User Experience Analysis

- **No FOUC:** Server resolves locale before HTML render — `<html lang>` and content are correct from first byte
- **No surprise redirects:** Accept-Language detection suggests, never forces — user stays in control
- **URL is source of truth:** `/{locale}/path` always serves that locale regardless of cookies/preferences
- **Graceful fallback:** Any missing translation falls back to English key, logged for monitoring
- **Accessibility:** `<html lang>` and `dir` correct from server render — screen readers get correct language from the start
- **Performance:** Lazy-loaded locale bundles (only English is synchronous), no extra round-trips for locale detection

---

## Database Schema Changes

**N/A.** i18n is entirely frontend + Worker layer. No schema changes, no RLS changes.

## Database Seeding Requirements

**N/A.** No new database entities.

## API Requirements

The backend API (`apps/backend`) already has full i18n support with `parseAcceptLanguage()` and localized error messages. No API changes needed.

The only API-layer change is at the **Worker** level (described in Phase 1 Deliverable 1) — this is infrastructure, not business logic.

## i18n Updates

This epic IS the i18n update. All translation files, i18n utilities, and locale infrastructure are in scope.

## Technical Debt Mitigation

| Debt Item | Resolution |
|-----------|-----------|
| Hardcoded `<html lang="en">` in layout.tsx | Server-resolved from Worker `X-Locale` header |
| Client-only locale detection causing FOUC | Worker resolves locale before HTML is served |
| Missing SEO signals (hreflang, Content-Language, canonical) | Full implementation in Phase 1 + Phase 3 |
| Duplicated locale constants between web and backend | Shared `i18n-constants.ts` in packages/ui |
| No Intl.* formatting utilities | Built in Phase 1, prevents ad-hoc solutions |
| Issues #221 and #222 blocking each other | Consumed into single epic with clear phase ordering |
| Skipped E2E tests for i18n | Enabled and expanded in Phase 3 |

---

## Success Criteria

- [ ] All 10 locales accessible via URL prefix (`/{locale}/`)
- [ ] English served at `/` with no prefix
- [ ] `<html lang>` and `dir` correct from server render (no client-side mutation)
- [ ] `Content-Language` header set on all responses
- [ ] `<link rel="alternate" hreflang="...">` present in `<head>` for all pages
- [ ] `<link rel="canonical">` present per locale page
- [ ] Invalid locale prefix → 302 redirect to English
- [ ] LanguageSwitcher navigates to locale-prefixed URL preserving path/query/hash
- [ ] Arabic pages render RTL with bidi-isolated LTR content
- [ ] Pluralization works for Arabic (6 forms), Russian (3), French (2)
- [ ] `Intl.*` formatters available for date, number, currency, relative time
- [ ] XML sitemap includes locale alternate links
- [ ] `robots.txt` includes `Sitemap:` directive
- [ ] Trailing slash normalization enforced via Worker redirects
- [ ] 70 page renders (10 locales × 7 pages) pass with no untranslated keys
- [ ] All E2E tests enabled and passing
- [ ] Issues #221 and #222 closed as superseded
- [ ] Locale suggestion prompt appears for non-English Accept-Language visitors and is dismissable
- [ ] Dual review (Claude + Codex) completed on all PRs
