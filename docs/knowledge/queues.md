# Cloudflare Queues — Dead Letter Queue (DLQ) Manual Verification

## Overview

Messages that fail all retry attempts are routed to the dead letter queue (DLQ).
Each environment has its own DLQ:

| Environment | Queue             | DLQ                        |
|-------------|-------------------|----------------------------|
| dev (local) | holding-jobs      | holding-jobs-dlq           |
| preview     | holding-jobs-preview  | holding-jobs-dlq-preview   |
| staging     | holding-jobs-staging  | holding-jobs-dlq-staging   |
| production  | holding-jobs-production | holding-jobs-dlq-production |

## Verifying DLQ Messages

### Via Cloudflare Dashboard

1. Navigate to Workers & Pages > Queues
2. Select the DLQ for the target environment
3. Review message count and inspect individual messages

### Via Wrangler CLI

```bash
# List queues
wrangler queues list

# Pull messages from DLQ for inspection (non-destructive peek)
wrangler queues consumer add <dlq-name> <consumer-worker> --batch-size 1
```

### Investigation Steps

1. Check the DLQ message for the original `correlationId` and `idempotencyKey`
2. Search worker logs for the `correlationId` to find the error trail
3. Identify the root cause from the error logs
4. Fix the processing logic if it is a code bug
5. Re-enqueue the message to the primary queue for reprocessing

## Important

- **Never delete DLQ messages** without investigation
- **Never process DLQ messages in production** without a fix deployed
- DLQ messages contain the original message envelope including payload
- The `idempotencyKey` field ensures safe reprocessing after fixes
