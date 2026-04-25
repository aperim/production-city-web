/**
 * GELF / syslog severity levels.
 * Lower number = higher severity (matches syslog RFC 5424).
 */
export const Level = {
  /** System is unusable */
  EMERGENCY: 0,
  /** Action must be taken immediately */
  ALERT: 1,
  /** Critical conditions */
  CRITICAL: 2,
  /** Error conditions */
  ERROR: 3,
  /** Warning conditions */
  WARNING: 4,
  /** Normal but significant condition */
  NOTICE: 5,
  /** Informational messages */
  INFO: 6,
  /** Debug-level messages */
  DEBUG: 7,
} as const;

export type LogLevel = (typeof Level)[keyof typeof Level];
