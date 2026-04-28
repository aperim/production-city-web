import { z } from "zod";

/**
 * Zod schema for the standard queue message envelope.
 *
 * All producers must wrap their payload in this envelope.
 */
export const QueueMessageSchema = z.object({
  type: z.string(),
  version: z.string(),
  idempotencyKey: z.string(),
  correlationId: z.string(),
  payload: z.unknown(),
});

/**
 * Standard queue message envelope for all messages in the holding-jobs queue.
 *
 * Inferred from QueueMessageSchema — single source of truth.
 */
export type QueueMessage<T = unknown> = Omit<
  z.infer<typeof QueueMessageSchema>,
  "payload"
> & {
  payload: T;
};

/** Payload for hubspot_contact_sync queue messages. */
export interface HubSpotContactSyncPayload {
  eoiId: string;
  name: string;
  email: string;
  company: string | null;
  category: string;
  message: string | null;
  sourcePage: string;
  locale: string;
  marketingOptIn: boolean;
  consentVersion: string;
  /** HubSpot tracking cookie (hubspotutk) captured from the original request. */
  hutk?: string;
  /** Visitor IP address captured from the original request. */
  ipAddress?: string;
}
