/**
 * Invitation email template.
 * Renders both HTML and plain text versions server-side.
 * All user-supplied content is HTML-escaped.
 */

import { escapeHtml } from "./magic-link.js";

/** Max length for invitation messages. */
export const INVITATION_MESSAGE_MAX_LENGTH = 500;

/** Validates an invitation message: max 500 chars, no HTML tags, no URLs. */
export function validateInvitationMessage(
  message: string,
): { valid: true } | { valid: false; reason: string } {
  if (message.length > INVITATION_MESSAGE_MAX_LENGTH) {
    return { valid: false, reason: `Message exceeds ${INVITATION_MESSAGE_MAX_LENGTH} characters` };
  }
  if (/<[^>]*>/.test(message)) {
    return { valid: false, reason: "Message must not contain HTML tags" };
  }
  if (/https?:\/\/\S+/i.test(message)) {
    return { valid: false, reason: "Message must not contain URLs" };
  }
  return { valid: true };
}

export interface InvitationEmailParams {
  /** Name of the person who sent the invitation */
  inviterName: string;
  /** Optional personal message from the inviter */
  message?: string;
  /** The full magic link URL */
  magicLinkUrl: string;
  /** The 6-digit code */
  code: string;
  /** Expiry duration text, e.g. "7 days" */
  expiresIn: string;
}

export function renderInvitationHtml(params: InvitationEmailParams): string {
  const safeInviter = escapeHtml(params.inviterName);
  const safeUrl = escapeHtml(params.magicLinkUrl);
  const safeCode = escapeHtml(params.code);
  const safeExpires = escapeHtml(params.expiresIn);

  const messageBlock = params.message
    ? `<p style="margin:0 0 24px;padding:16px;background-color:#f4f4f5;border-radius:6px;font-size:14px;line-height:1.6;color:#52525b;font-style:italic;">${escapeHtml(params.message)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>You've been invited to Production City</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f5;color:#18181b;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:8px;padding:40px;border:1px solid #e4e4e7;">
<tr><td>
<h1 style="margin:0 0 24px;font-size:20px;font-weight:600;color:#18181b;">You've been invited to Production City</h1>
<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#52525b;">${safeInviter} has invited you to join Production City.</p>
${messageBlock}
<p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#52525b;">Click the button below to accept. This invitation expires in ${safeExpires}.</p>
<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="border-radius:6px;background-color:#18181b;">
<a href="${safeUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">Accept invitation</a>
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

export function renderInvitationText(params: InvitationEmailParams): string {
  const messageBlock = params.message
    ? `\nPersonal message from ${params.inviterName}:\n"${params.message}"\n`
    : "";

  return `You've been invited to Production City

${params.inviterName} has invited you to join Production City.
${messageBlock}
Click the link below to accept. This invitation expires in ${params.expiresIn}.

${params.magicLinkUrl}

Or enter this code manually: ${params.code}

If you didn't request this, you can safely ignore this email.`;
}
