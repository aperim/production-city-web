/**
 * WebSocket E2E test helpers.
 *
 * Provides utilities for testing WebSocket connection lifecycle,
 * message capture, and simulated disconnection/network scenarios.
 */

import type { Page } from "@playwright/test";

export interface WSMessage {
  type: string;
  channel?: string;
  payload: unknown;
  ts: number;
  id: string;
}

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8787";

export class WebSocketTestHelper {
  /**
   * Wait for a WebSocket connection to be established.
   * Uses page.evaluate to check the connection state via the React context.
   */
  async waitForConnection(page: Page, timeout = 10_000): Promise<void> {
    await page.waitForFunction(
      () => {
        const indicator = document.querySelector("[data-testid='connection-dot']");
        return indicator?.getAttribute("data-state") === "connected";
      },
      { timeout },
    );
  }

  /**
   * Capture WebSocket messages by intercepting them in the page context.
   * Returns a handle that can be used to retrieve captured messages.
   */
  async captureMessages(page: Page, filter?: string): Promise<WSMessage[]> {
    return page.evaluate((filterType) => {
      return new Promise<WSMessage[]>((resolve) => {
        const messages: WSMessage[] = [];

        // Listen to a custom event dispatched by the WS provider for testing
        const handler = (e: CustomEvent) => {
          const msg = e.detail as WSMessage;
          if (!filterType || msg.type === filterType) {
            messages.push(msg);
          }
        };

        window.addEventListener("ws-test-message" as string, handler as EventListener);

        // Collect for 5 seconds then return
        setTimeout(() => {
          window.removeEventListener("ws-test-message" as string, handler as EventListener);
          resolve(messages);
        }, 5000);
      });
    }, filter);
  }

  /**
   * Simulate WebSocket disconnection by going offline.
   */
  async simulateDisconnect(page: Page): Promise<void> {
    const context = page.context();
    await context.setOffline(true);
    // Wait a moment for the disconnect to propagate
    await page.waitForTimeout(500);
  }

  /**
   * Simulate network offline/online state change.
   */
  async simulateNetworkChange(page: Page, online: boolean): Promise<void> {
    const context = page.context();
    await context.setOffline(!online);
    if (online) {
      // Dispatch online event
      await page.evaluate(() => {
        window.dispatchEvent(new Event("online"));
      });
    }
  }

  /**
   * Simulate page visibility change (tab hidden/visible).
   */
  async simulateVisibilityChange(page: Page, visible: boolean): Promise<void> {
    await page.evaluate((isVisible) => {
      Object.defineProperty(document, "visibilityState", {
        value: isVisible ? "visible" : "hidden",
        writable: true,
        configurable: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    }, visible);
  }

  /**
   * Wait for a specific message type to appear in the page context.
   */
  async waitForMessage(page: Page, type: string, timeout = 10_000): Promise<WSMessage | null> {
    try {
      return await page.evaluate(
        ({ messageType, timeoutMs }) => {
          return new Promise<WSMessage | null>((resolve) => {
            const handler = (e: CustomEvent) => {
              const msg = e.detail as WSMessage;
              if (msg.type === messageType) {
                window.removeEventListener("ws-test-message" as string, handler as EventListener);
                resolve(msg);
              }
            };

            window.addEventListener("ws-test-message" as string, handler as EventListener);

            setTimeout(() => {
              window.removeEventListener("ws-test-message" as string, handler as EventListener);
              resolve(null);
            }, timeoutMs);
          });
        },
        { messageType: type, timeoutMs: timeout },
      );
    } catch {
      return null;
    }
  }

  /**
   * Trigger a delivery status change via the backend test API.
   * Simulates what a Postmark webhook would do.
   */
  async triggerDeliveryStatus(magicLinkId: string, status: string): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/v1/test/trigger-delivery-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ magicLinkId, status }),
    });

    if (!res.ok) {
      // Endpoint may not exist in test API — log but don't fail
      console.warn(`trigger-delivery-status returned ${res.status}`);
    }
  }

  /**
   * Simulate deployment disconnect by injecting a server_shutdown message.
   */
  async simulateDeploymentDisconnect(page: Page): Promise<void> {
    await page.evaluate(() => {
      // Find the WebSocket instance and inject a shutdown message
      const shutdownMsg = JSON.stringify({
        v: 1,
        type: "server_shutdown",
        payload: { reason: "deployment" },
        ts: Date.now(),
        id: crypto.randomUUID(),
      });

      // Dispatch as if received from server
      window.dispatchEvent(new CustomEvent("ws-test-inject", {
        detail: shutdownMsg,
      }));
    });
  }

  /**
   * Check if any WebSocket connections are active in the page.
   */
  async hasActiveConnection(page: Page): Promise<boolean> {
    return page.evaluate(() => {
      const indicator = document.querySelector("[data-testid='connection-dot']");
      return indicator?.getAttribute("data-state") === "connected";
    });
  }

  /**
   * Get the current connection state from the UI.
   */
  async getConnectionState(page: Page): Promise<string | null> {
    return page.evaluate(() => {
      const indicator = document.querySelector("[data-testid='connection-dot']");
      return indicator?.getAttribute("data-state") ?? null;
    });
  }
}
