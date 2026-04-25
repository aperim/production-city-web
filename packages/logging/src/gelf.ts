import { Level, type LogLevel } from "./levels.js";

/**
 * GELF 1.1 mandatory fields.
 */
export interface GelfMessage {
  /** Always "1.1" */
  version: "1.1";
  /** Source host / Worker name */
  host: string;
  /** Human-readable summary (must not be blank) */
  short_message: string;
  /** Unix epoch with optional decimal seconds */
  timestamp: number;
  /** Syslog severity 0–7 */
  level: LogLevel;
  /** Optional extended detail */
  full_message?: string;
  /** Service identifier, e.g. "holding-backend" */
  _service?: string;
  /** Deployment environment */
  _environment?: "dev" | "preview" | "staging" | "production";
  /** Correlation ID for request tracing */
  _request_id?: string;
  /** Cloudflare Worker name */
  _worker_name?: string;
  /** Request or operation duration in milliseconds */
  _duration_ms?: number;
  /** HTTP response status code */
  _status_code?: number;
  /** Error classification, e.g. "ValidationError" */
  _error_type?: string;
  /** CF-Ray header value for Cloudflare tracing */
  _cf_ray?: string;
  /** Allow additional underscore-prefixed custom fields */
  [key: `_${string}`]: string | number | boolean | undefined;
}

export interface GelfFields {
  /** Human-readable summary */
  short_message: string;
  /** Syslog severity level (default: INFO) */
  level?: LogLevel;
  /** Optional extended detail */
  full_message?: string;
  /** Service identifier */
  service?: string;
  /** Deployment environment */
  environment?: "dev" | "preview" | "staging" | "production";
  /** Correlation request ID */
  request_id?: string;
  /** Cloudflare Worker name */
  worker_name?: string;
  /** Duration in ms */
  duration_ms?: number;
  /** HTTP status code */
  status_code?: number;
  /** Error class name */
  error_type?: string;
  /** CF-Ray header */
  cf_ray?: string;
  /** Additional custom fields (must be underscore-prefixed) */
  extra?: Record<string, string | number | boolean>;
}

/**
 * Build a GELF 1.1 message object.
 *
 * @param host  Source identifier (Worker name, hostname).
 * @param fields Log fields.
 * @returns A complete GelfMessage ready for JSON serialisation.
 */
export function buildGelfMessage(host: string, fields: GelfFields): GelfMessage {
  const message: GelfMessage = {
    version: "1.1",
    host,
    short_message: fields.short_message,
    timestamp: Date.now() / 1000,
    level: fields.level ?? Level.INFO,
  };

  if (fields.full_message !== undefined) message.full_message = fields.full_message;
  if (fields.service !== undefined) message._service = fields.service;
  if (fields.environment !== undefined) message._environment = fields.environment;
  if (fields.request_id !== undefined) message._request_id = fields.request_id;
  if (fields.worker_name !== undefined) message._worker_name = fields.worker_name;
  if (fields.duration_ms !== undefined) message._duration_ms = fields.duration_ms;
  if (fields.status_code !== undefined) message._status_code = fields.status_code;
  if (fields.error_type !== undefined) message._error_type = fields.error_type;
  if (fields.cf_ray !== undefined) message._cf_ray = fields.cf_ray;

  if (fields.extra !== undefined) {
    for (const [k, v] of Object.entries(fields.extra)) {
      const key = k.startsWith("_") ? k : `_${k}`;
      message[key as `_${string}`] = v;
    }
  }

  return message;
}

/**
 * Serialise a GelfMessage to a JSON string.
 */
export function toGelfJson(message: GelfMessage): string {
  return JSON.stringify(message);
}
