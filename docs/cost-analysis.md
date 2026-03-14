# WebSocket Hibernation — Cost Analysis

**Epic**: #182 — WebSocket Hibernation
**Issue**: #198 — Cost Estimation & Load Testing Plan
**Date**: 2026-03-14

---

## 1. Current Polling Cost Model (Baseline)

### Per Magic Link Request

When a user submits a login form, the frontend polls for delivery status:

| Parameter | Value |
|-----------|-------|
| Poll count per login | ~12 polls (1s, 2s, 4s, 5s, 5s... over 60s) |
| Worker invocations per poll | 1 |
| D1 reads per poll | 1 (query MagicLink delivery status) |
| Total Worker invocations per login | ~12 |
| Total D1 reads per login | ~12 |

### Daily Estimates

| Variable | Low (50 logins/day) | Medium (200 logins/day) | High (500 logins/day) |
|----------|---------------------|------------------------|----------------------|
| Worker invocations | 600 | 2,400 | 6,000 |
| D1 reads | 600 | 2,400 | 6,000 |
| D1 rows read | 600 | 2,400 | 6,000 |

### Monthly Cost (Polling)

| Component | Free tier | Cost beyond free |
|-----------|-----------|-----------------|
| Worker requests | 100K/day free | $0.30/M requests |
| D1 reads | 5M/day free | $0.001/M rows read |
| **Total monthly (200 logins/day)** | **$0.00** | Well within free tier |

---

## 2. WebSocket Hibernation Cost Model

### Per Login (Delivery Tracking)

| Component | Count | Notes |
|-----------|-------|-------|
| DO requests (upgrade) | 1 | WebSocket handshake |
| DO requests (message) | 2-3 | connection_ack + delivery_status + close |
| DO duration (active) | ~5s | Until delivery status received |
| DO duration (hibernated) | ~55s | Waiting for webhook (free) |
| D1 reads | 0 | Status pushed from webhook, no polling |
| Worker invocations | 2 | Upgrade request + webhook POST |

### Per Admin Session (Notifications)

| Component | Count/Hour | Notes |
|-----------|------------|-------|
| DO requests (messages) | ~10 | Notification broadcasts |
| DO hibernation wakes | ~10 | One per broadcast |
| DO duration (active) | ~2s per wake | Brief wake to broadcast |
| DO duration (hibernated) | ~59m 40s | Mostly hibernated (free) |
| D1 reads | 12 | Session revalidation every 5 min |

### Variables Table

| Variable | Low | Medium | High | Source |
|----------|-----|--------|------|--------|
| Daily magic link requests | 50 | 200 | 500 | Product estimate |
| Concurrent admin users | 5 | 15 | 50 | Product estimate |
| Admin session duration | 2h | 4h | 8h | Usage patterns |
| Admin message frequency | 5/hr | 10/hr | 30/hr | Event rate |
| DO instances (delivery) | 50/day | 200/day | 500/day | 1 per login |
| DO instances (admin-hub) | 1 | 1 | 1 | Shared instance |
| Reconnection rate | 2%/hr | 5%/hr | 10%/hr | Network variability |

### Daily Estimates (WebSocket)

| Metric | Low | Medium | High |
|--------|-----|--------|------|
| Worker invocations | 100 + admin | 400 + admin | 1,000 + admin |
| D1 reads | 60 (admin revalidation) | 180 | 600 |
| DO requests (delivery) | 150 | 600 | 1,500 |
| DO requests (admin) | 50 | 150 | 1,500 |
| DO duration (GB-s, active) | 0.25 | 1.0 | 5.0 |
| DO duration (GB-s, hibernated) | Free | Free | Free |

---

## 3. Cost Comparison

### Monthly Cost @ Medium Scale (200 logins/day, 15 concurrent admins)

| Metric | Polling | WebSocket | Delta |
|--------|---------|-----------|-------|
| Worker invocations/month | 72,000 | 12,000 | -83% |
| D1 reads/month | 72,000 | 5,400 | -92% |
| DO requests/month | 0 | 22,500 | New cost |
| DO duration (GB-s)/month | 0 | 30 | New cost |
| **Est. monthly cost** | **$0.00** (free tier) | **$0.00** (free tier) | **Neutral** |

### Cloudflare Pricing (as of March 2026)

| Resource | Free Tier | Paid (Workers Paid plan, $5/mo) |
|----------|-----------|-------------------------------|
| Worker requests | 100K/day | 10M/mo included, $0.30/M after |
| D1 reads | 5M/day | 25B rows/mo, $0.001/M rows |
| DO requests | n/a | 1M/mo included, $0.15/M after |
| DO duration | n/a | 400K GB-s/mo, $12.50/M GB-s |
| DO storage | n/a | 1GB included, $0.20/GB-mo |

### At Scale (Paid plan)

| Metric | Polling @ 5K/day | WebSocket @ 5K/day |
|--------|-----------------|-------------------|
| Worker requests/mo | 1.8M | 300K |
| D1 reads/mo | 1.8M | 54K |
| DO requests/mo | 0 | 225K |
| DO duration (GB-s) | 0 | 300 |
| **Worker cost** | $0.24 | $0.00 (included) |
| **D1 cost** | $0.00 | $0.00 (included) |
| **DO cost** | $0.00 | $0.00 (included) |
| **Total beyond plan** | **$0.24/mo** | **$0.00/mo** |

---

## 4. Break-Even Analysis

At current scale (sub-1000 logins/day), both approaches cost effectively **$0.00** on either free or paid plans. The break-even point where WebSocket becomes measurably cheaper:

- **Worker invocations**: WebSocket saves ~83% of Worker calls. At 10M+ login requests/month, this saves ~$2.40/month.
- **D1 reads**: WebSocket eliminates polling D1 reads. At 10M+ reads/month, this saves ~$0.01/month.
- **DO cost**: Negligible at all modeled scales due to hibernation (active duration is minimal).

**Conclusion**: The cost difference is negligible at Production City's current and projected scale. The decision to use WebSocket Hibernation is driven by **user experience** (instant delivery status, real-time notifications) rather than cost savings.

### When WebSocket Becomes More Expensive

WebSocket cost scales with:
1. **Concurrent connections** — DO storage/memory grows with active connections
2. **Message frequency** — each broadcast wakes the DO from hibernation
3. **Session duration** — longer sessions = more session revalidation D1 reads

At >50,000 concurrent admin connections with >100 messages/minute, DO costs could exceed $10/month. This is well beyond projected scale.

---

## 5. Recommendations

1. **Stay on free plan** until traffic exceeds free-tier limits (~100K Worker requests/day)
2. **Monitor DO hibernation wakes** — if wakes exceed 1M/month, review message batching
3. **Monitor D1 reads from session revalidation** — the 5-minute interval can be extended to 15 minutes if D1 costs become significant
4. **No infrastructure changes needed** — current architecture handles 10x growth within free tier
