/**
 * Magic link login email template.
 * Renders both HTML and plain text versions server-side.
 * All user-supplied content is HTML-escaped.
 */

/** Escape HTML special characters to prevent XSS/injection. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export interface MagicLinkEmailParams {
  /** The full magic link URL */
  magicLinkUrl: string;
  /** The 6-digit code */
  code: string;
  /** Expiry duration text, e.g. "15 minutes" */
  expiresIn: string;
}

export function renderMagicLinkHtml(params: MagicLinkEmailParams): string {
  const safeUrl = escapeHtml(params.magicLinkUrl);
  const safeCode = escapeHtml(params.code);
  const safeExpires = escapeHtml(params.expiresIn);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign in to Production City</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f5;color:#18181b;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:8px;padding:40px;border:1px solid #e4e4e7;">
<tr><td>
<h1 style="margin:0 0 24px;font-size:20px;font-weight:600;color:#18181b;">Sign in to Production City</h1>
<p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#52525b;">Click the button below to sign in. This link expires in ${safeExpires}.</p>
<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="border-radius:6px;background-color:#18181b;">
<a href="${safeUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">Sign in</a>
</td></tr>
</table>
<p style="margin:0 0 8px;font-size:14px;color:#52525b;">Or enter this code manually:</p>
<p style="margin:0 0 24px;font-size:28px;font-weight:700;letter-spacing:4px;color:#18181b;font-family:monospace;">${safeCode}</p>
<p style="margin:0;font-size:12px;color:#a1a1aa;">If you didn't request this, you can safely ignore this email.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function renderMagicLinkText(params: MagicLinkEmailParams): string {
  return `Sign in to Production City

Click the link below to sign in. This link expires in ${params.expiresIn}.

${params.magicLinkUrl}

Or enter this code manually: ${params.code}

If you didn't request this, you can safely ignore this email.`;
}
