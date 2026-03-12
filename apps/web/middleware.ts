import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers middleware.
 *
 * Applies Content-Security-Policy, X-Content-Type-Options,
 * Referrer-Policy, X-Frame-Options, and Cache-Control to all responses.
 */
export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // 'unsafe-inline' required for React SSR hydration scripts injected by vinext.
  // TODO(#48): replace with nonce-based CSP once vinext supports nonce propagation.
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Cache-Control",
    "public, max-age=0, must-revalidate",
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
