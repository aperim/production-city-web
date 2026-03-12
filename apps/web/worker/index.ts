/**
 * apps/web custom worker entry — wraps the vinext app-router handler and
 * injects HTTP security response headers on every response.
 *
 * @see Issue #45
 */
import handler from "vinext/server/app-router-entry";

/** Security headers applied to every response. */
const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export default {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
     
    const response = (await (handler as ExportedHandler).fetch!(
      request as Parameters<ExportedHandlerFetchHandler>[0],
      env,
      ctx,
    )) as Response;
    const newResponse = new Response(response.body, response);
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      newResponse.headers.set(key, value);
    }
    return newResponse;
  },
} satisfies ExportedHandler;
