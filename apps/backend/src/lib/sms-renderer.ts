/**
 * SMS renderer for announcement delivery.
 * Renders within 320-char limit (2 SMS segments).
 */

/** Max total SMS length (2 segments). */
const MAX_SMS_LENGTH = 320;
/** Max title length before truncation. */
const MAX_TITLE_LENGTH = 60;
/** Max summary length before truncation. */
const MAX_SUMMARY_LENGTH = 150;
/** STOP note appended to every SMS. */
const STOP_NOTE = "Reply STOP to unsubscribe.";

/** Truncate a string with ellipsis if too long. */
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "\u2026";
}

export interface SmsRenderParams {
  title: string;
  summary: string;
  announcementUrl: string;
}

/**
 * Render an SMS message for an announcement.
 * Format:
 *   {title}
 *   {summary}
 *   Read more: {url}
 *   Reply STOP to unsubscribe.
 */
export function renderAnnouncementSms(params: SmsRenderParams): string {
  const title = truncate(params.title, MAX_TITLE_LENGTH);
  const summary = truncate(params.summary, MAX_SUMMARY_LENGTH);
  const readMore = `Read more: ${params.announcementUrl}`;

  const message = `${title}\n\n${summary}\n\n${readMore}\n\n${STOP_NOTE}`;

  // Final truncation if still over limit
  if (message.length > MAX_SMS_LENGTH) {
    return message.slice(0, MAX_SMS_LENGTH - 1) + "\u2026";
  }
  return message;
}
