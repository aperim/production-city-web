/**
 * k6 WebSocket Load Test Suite
 *
 * Tests WebSocket Hibernation system under load.
 * Run: k6 run docs/load-tests/websocket.js
 *
 * @see docs/load-testing.md for full test plan
 * @see #198 — Cost Estimation & Load Testing Plan
 */

import ws from "k6/ws";
import { check, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// --- Configuration ---

const BASE_URL = __ENV.BASE_URL || "ws://localhost:8787";
const _BACKEND_URL = __ENV.BACKEND_URL || "http://localhost:8787";
const SCENARIO = __ENV.SCENARIO || "all";

// --- Custom Metrics ---

const wsConnectionTime = new Trend("ws_connection_time", true);
const wsMessageLatency = new Trend("ws_message_latency", true);
const wsConnectionErrors = new Counter("ws_connection_errors");
const wsConnectionSuccess = new Rate("ws_connection_success");
const wsMessagesReceived = new Counter("ws_messages_received");

// --- Thresholds ---

export const options = {
  thresholds: {
    ws_connection_time: ["p(95)<500"],
    ws_message_latency: ["p(95)<200"],
    ws_connection_success: ["rate>0.99"],
  },
  scenarios: getScenarios(),
};

function getScenarios() {
  if (SCENARIO === "connection-capacity" || SCENARIO === "all") {
    return {
      connection_capacity: {
        executor: "ramping-vus",
        startVUs: 0,
        stages: [
          { duration: "30s", target: 100 },
          { duration: "2m", target: 100 },
          { duration: "1m", target: 500 },
          { duration: "2m", target: 500 },
        ],
        exec: "connectionCapacity",
      },
    };
  }

  if (SCENARIO === "broadcast-fanout") {
    return {
      broadcast_fanout: {
        executor: "constant-vus",
        vus: 50,
        duration: "5m",
        exec: "broadcastFanout",
      },
    };
  }

  if (SCENARIO === "reconnection-storm") {
    return {
      reconnection_storm: {
        executor: "constant-vus",
        vus: 100,
        duration: "2m",
        exec: "reconnectionStorm",
      },
    };
  }

  if (SCENARIO === "delivery-throughput") {
    return {
      delivery_throughput: {
        executor: "constant-vus",
        vus: 100,
        duration: "5m",
        exec: "deliveryThroughput",
      },
    };
  }

  // Default: run connection capacity
  return {
    connection_capacity: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 100 },
        { duration: "2m", target: 100 },
      ],
      exec: "connectionCapacity",
    },
  };
}

// --- Test Functions ---

/**
 * Test 1: Connection Capacity
 * Ramp up concurrent WebSocket connections and hold.
 */
export function connectionCapacity() {
  const url = `${BASE_URL}/v1/ws`;
  const startTime = Date.now();

  const res = ws.connect(url, {}, function (socket) {
    socket.on("open", function () {
      const elapsed = Date.now() - startTime;
      wsConnectionTime.add(elapsed);
      wsConnectionSuccess.add(true);

      // Subscribe to a channel
      socket.send(
        JSON.stringify({
          v: 1,
          type: "subscribe",
          payload: { channel: "admin:notifications" },
          ts: Date.now(),
          id: generateUUID(),
        }),
      );
    });

    socket.on("message", function (msg) {
      wsMessagesReceived.add(1);
      try {
        const data = JSON.parse(msg);
        if (data.type === "error") {
          console.warn(`WS error: ${data.payload.code} — ${data.payload.message}`);
        }
      } catch {
        // ignore
      }
    });

    socket.on("error", function () {
      wsConnectionErrors.add(1);
      wsConnectionSuccess.add(false);
    });

    socket.on("close", function () {
      // Connection closed
    });

    // Keep connection alive for the duration of the VU
    sleep(30);
    socket.close();
  });

  check(res, {
    "WebSocket connected": (r) => r && r.status === 101,
  });
}

/**
 * Test 2: Broadcast Fan-Out
 * Subscribe to admin channel and measure broadcast delivery latency.
 */
export function broadcastFanout() {
  const url = `${BASE_URL}/v1/ws`;

  ws.connect(url, {}, function (socket) {
    socket.on("open", function () {
      wsConnectionSuccess.add(true);

      // Subscribe to admin notifications
      socket.send(
        JSON.stringify({
          v: 1,
          type: "subscribe",
          payload: { channel: "admin:notifications" },
          ts: Date.now(),
          id: generateUUID(),
        }),
      );
    });

    socket.on("message", function (msg) {
      wsMessagesReceived.add(1);
      try {
        const data = JSON.parse(msg);
        if (data.type === "notification" && data.ts) {
          const latency = Date.now() - data.ts;
          wsMessageLatency.add(latency);
        }
      } catch {
        // ignore
      }
    });

    socket.on("error", function () {
      wsConnectionErrors.add(1);
      wsConnectionSuccess.add(false);
    });

    // Hold connection for test duration
    sleep(60);
    socket.close();
  });
}

/**
 * Test 3: Reconnection Storm
 * Connect, disconnect, and reconnect with jitter.
 */
export function reconnectionStorm() {
  const url = `${BASE_URL}/v1/ws`;

  // First connection
  ws.connect(url, {}, function (socket) {
    socket.on("open", function () {
      wsConnectionSuccess.add(true);
    });

    socket.on("error", function () {
      wsConnectionErrors.add(1);
    });

    // Hold briefly, then close to simulate deployment disconnect
    sleep(5);
    socket.close();
  });

  // Jittered reconnection delay (0-5 seconds, simulating client jitter)
  const jitter = Math.random() * 5;
  sleep(jitter);

  // Reconnection attempt
  const reconnectStart = Date.now();
  ws.connect(url, {}, function (socket) {
    socket.on("open", function () {
      const elapsed = Date.now() - reconnectStart;
      wsConnectionTime.add(elapsed);
      wsConnectionSuccess.add(true);
    });

    socket.on("error", function () {
      wsConnectionErrors.add(1);
      wsConnectionSuccess.add(false);
    });

    sleep(10);
    socket.close();
  });
}

/**
 * Test 4: Delivery Status Throughput
 * Open delivery-specific WebSocket connections and measure status push latency.
 */
export function deliveryThroughput() {
  const deliveryId = `load-test-${__VU}-${__ITER}`;
  const url = `${BASE_URL}/v1/ws/delivery?token=${deliveryId}`;
  const startTime = Date.now();

  ws.connect(url, {}, function (socket) {
    socket.on("open", function () {
      const elapsed = Date.now() - startTime;
      wsConnectionTime.add(elapsed);
      wsConnectionSuccess.add(true);
    });

    socket.on("message", function (msg) {
      wsMessagesReceived.add(1);
      try {
        const data = JSON.parse(msg);
        if (data.type === "delivery_status" && data.ts) {
          const latency = Date.now() - data.ts;
          wsMessageLatency.add(latency);
        }
      } catch {
        // ignore
      }
    });

    socket.on("error", function () {
      wsConnectionErrors.add(1);
      wsConnectionSuccess.add(false);
    });

    // Wait for delivery status (up to 30s)
    sleep(30);
    socket.close();
  });
}

// --- Utilities ---

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
