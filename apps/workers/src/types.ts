/**
 * Standard queue message envelope for all messages in the holding-jobs queue.
 *
 * All producers must wrap their payload in this envelope.
 */
export interface QueueMessage<T = unknown> {
  type: string;
  version: string;
  idempotencyKey: string;
  correlationId: string;
  payload: T;
}
