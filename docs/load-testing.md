# WebSocket Hibernation — Load Testing Plan

**Epic**: #182 — WebSocket Hibernation
**Issue**: #198 — Cost Estimation & Load Testing Plan
**Date**: 2026-03-14

---

## 1. Overview

This document defines load test scenarios for the WebSocket Hibernation system. Tests validate that the system meets performance targets under expected and peak load conditions.

**Tool**: [k6](https://k6.io/) with the WebSocket extension (`k6/ws`)

---

## 2. Target Metrics

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Connection establishment (p95) | < 500ms | < 2s |
| Message delivery latency (p95) | < 200ms | < 1s |
| Broadcast fan-out to 100 (p95) | < 500ms | < 2s |
| Reconnection after disconnect (p95) | < 3s | < 10s |
| Hibernation wake + response (p95) | < 1s | < 3s |
| 1000 concurrent connections | Stable, 0 errors | < 1% error rate |
| Reconnection storm (100 clients) | All within 30s | All within 60s |

---

## 3. Test Scenarios

### Scenario 1: Connection Capacity

Ramp to 1000 concurrent WebSocket connections against a single DO and hold for 5 minutes.

**Purpose**: Validate the per-DO connection cap (1000) and memory behavior under maximum load.

**Stages**:
1. Ramp from 0 to 100 connections over 30s
2. Hold at 100 for 2 minutes
3. Ramp to 500 over 1 minute
4. Hold at 500 for 2 minutes
5. Ramp to 1000 over 1 minute
6. Hold at 1000 for 5 minutes
7. Ramp down to 0 over 30s

**Thresholds**:
- Connection success rate > 99%
- No DO crashes or restarts
- Memory usage stays within DO limits

### Scenario 2: Broadcast Fan-Out Latency

50 subscribers on `admin:notifications` channel. Trigger 100 broadcast messages over 5 minutes and measure delivery latency.

**Purpose**: Validate that broadcast reaches all subscribers within latency targets.

**Metrics**:
- Time from Worker broadcast call to client message receipt
- p50, p95, p99 latency distribution
- Message ordering preservation

**Thresholds**:
- p95 delivery latency < 200ms
- p99 delivery latency < 500ms
- 0 lost messages

### Scenario 3: Reconnection Storm

100 clients simultaneously disconnected (simulating deployment). Measure reconnection behavior with jitter.

**Purpose**: Validate thundering herd mitigation and reconnection backoff.

**Stages**:
1. Establish 100 connections
2. Disconnect all simultaneously
3. All clients attempt reconnection with configured jitter
4. Measure time until all 100 are reconnected

**Thresholds**:
- All 100 reconnected within 30s
- No more than 20 concurrent reconnection attempts (jitter spreading)
- 0 permanent failures

### Scenario 4: Delivery Status Throughput

100 concurrent delivery tracking sessions. Each session opens a WebSocket, subscribes to its delivery channel, and waits for a status update.

**Purpose**: Validate that delivery status push works at scale across many independent DO instances.

**Stages**:
1. Create 100 magic links via test API
2. Open 100 WebSocket connections (one per delivery channel)
3. Trigger delivery status webhooks for all 100
4. Measure time from webhook to client receipt

**Thresholds**:
- p95 delivery latency < 100ms
- All 100 sessions receive their status update
- 0 cross-contamination (no session receives wrong status)

### Scenario 5: Hibernation Wake Latency

After 5 minutes of inactivity (DO hibernated), send a broadcast and measure wake-to-delivery time.

**Purpose**: Validate that hibernation wake is fast enough for real-time notifications.

**Stages**:
1. Establish 10 admin connections
2. Subscribe to `admin:notifications`
3. Wait 5 minutes (DO hibernates)
4. Trigger a broadcast
5. Measure time from trigger to client receipt

**Thresholds**:
- p95 wake + delivery latency < 1s
- p99 wake + delivery latency < 2s

---

## 4. How to Run

### Prerequisites

```bash
# Install k6
brew install grafana/k6/k6    # macOS
# or: https://grafana.com/docs/k6/latest/set-up/install-k6/

# Ensure staging environment is running
# (k6 tests should NOT run against production)
```

### Run

```bash
# All scenarios
k6 run docs/load-tests/websocket.js

# Specific scenario
k6 run docs/load-tests/websocket.js --env SCENARIO=connection-capacity

# With HTML report
k6 run docs/load-tests/websocket.js --out json=results.json
```

### CI Integration

Load tests run as a **separate CI step** (not on every PR):

```yaml
# .github/workflows/load-test.yml (manual trigger)
on:
  workflow_dispatch:
    inputs:
      scenario:
        description: 'Test scenario to run'
        default: 'all'
```

---

## 5. Environment Requirements

| Requirement | Detail |
|-------------|--------|
| Target | Staging environment with DO bindings |
| Auth | Test API must be enabled (TEST_ENABLED=true) |
| Network | k6 runner must be able to reach staging WS endpoint |
| Duration | Full suite: ~20 minutes |
| Frequency | Run before major releases, after architecture changes |

---

## 6. Result Documentation

After each load test run, update this section with:

1. Date and environment details
2. Pass/fail for each threshold
3. Latency distribution graphs (if available)
4. Identified bottlenecks or concerns
5. Recommendations for capacity adjustments

### Results Log

_No results yet — run load tests against staging to populate._
