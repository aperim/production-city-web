/**
 * Content-Security-Policy builder.
 *
 * Extracted so unit tests can import and verify the real CSP logic
 * without pulling in the full vinext worker handler.
 *
 * Script hash covers the static inline theme-flash prevention script in layout.tsx.
 * If that script changes, recalculate: echo -n '<script>' | openssl dgst -sha256 -binary | base64
 * @see PRO-353
 * @see PRO-399
 */

export const THEME_SCRIPT_HASH =
  "'sha256-Ldif8QlNCK0+4XhlJPg3q8xt1zVJEDh3VbMr0vbaiBE='";

const HUBSPOT_SCRIPT_ORIGINS =
  "https://js.hs-scripts.com https://js.hsforms.net https://js.hscollectedforms.net https://js.usemessages.com";
const HUBSPOT_CONNECT_ORIGINS =
  "https://track.hubspot.com https://forms.hubspot.com https://api.hubapi.com";
const HUBSPOT_IMG_ORIGINS = "https://track.hubspot.com https://forms.hubspot.com";
const HUBSPOT_FRAME_ORIGINS = "https://app.hubspot.com";

/**
 * Build Content-Security-Policy header with WebSocket and API directives.
 * Dev (localhost/127.0.0.1): allows ws://localhost:* and wss://localhost:*
 * All other envs: derives API host from request hostname so staging and
 * production each allow their own api.* subdomain (PRO-194).
 */
export function buildCsp(hostname: string): string {
  const isDev = hostname === "localhost" || hostname === "127.0.0.1";
  if (isDev) {
    return [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com ${HUBSPOT_SCRIPT_ORIGINS}`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: ${HUBSPOT_IMG_ORIGINS}`,
      `font-src 'self' https://fonts.gstatic.com`,
      `connect-src 'self' ws://localhost:* wss://localhost:* ${HUBSPOT_CONNECT_ORIGINS}`,
      `frame-src ${HUBSPOT_FRAME_ORIGINS}`,
    ].join("; ");
  }
  const baseHost = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
  const apiOrigin = `api.${baseHost}`;
  return [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com ${HUBSPOT_SCRIPT_ORIGINS}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: ${HUBSPOT_IMG_ORIGINS}`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' https://${apiOrigin} wss://${apiOrigin} ${HUBSPOT_CONNECT_ORIGINS}`,
    `frame-src ${HUBSPOT_FRAME_ORIGINS}`,
  ].join("; ");
}
