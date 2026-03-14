/**
 * Multi-tab coordinator using BroadcastChannel for leader election.
 *
 * Only the leader tab maintains the WebSocket connection.
 * Other tabs receive messages via BroadcastChannel relay.
 * Leader heartbeat every 5s; promote new leader if no heartbeat for 10s.
 */

export interface TabCoordinatorOptions {
  channelName?: string;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
}

export type TabMessage =
  | { type: "heartbeat"; tabId: string }
  | { type: "claim"; tabId: string }
  | { type: "relay"; data: unknown }
  | { type: "resign"; tabId: string };

const DEFAULT_HEARTBEAT_INTERVAL = 5000;
const DEFAULT_HEARTBEAT_TIMEOUT = 10000;

export class TabCoordinator {
  private broadcastChannel: BroadcastChannel | null = null;
  private tabId: string;
  private _isLeader = false;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private onLeaderChangeCallbacks: Array<(isLeader: boolean) => void> = [];
  private onMessageCallbacks: Array<(data: unknown) => void> = [];
  private heartbeatInterval: number;
  private heartbeatTimeout: number;
  private destroyed = false;

  constructor(options: TabCoordinatorOptions = {}) {
    this.tabId = crypto.randomUUID();
    this.heartbeatInterval = options.heartbeatInterval ?? DEFAULT_HEARTBEAT_INTERVAL;
    this.heartbeatTimeout = options.heartbeatTimeout ?? DEFAULT_HEARTBEAT_TIMEOUT;

    if (typeof BroadcastChannel === "undefined") {
      // BroadcastChannel not supported — this tab acts as sole leader
      this._isLeader = true;
      return;
    }

    this.broadcastChannel = new BroadcastChannel(options.channelName ?? "ws-tab-coordinator");
    this.broadcastChannel.onmessage = (event: MessageEvent<TabMessage>) => {
      this.handleMessage(event.data);
    };

    // Claim leadership
    this.claimLeadership();
  }

  get isLeader(): boolean {
    return this._isLeader;
  }

  /**
   * Attempt to claim leadership. If no other tab responds with a heartbeat
   * within a short window, this tab becomes leader.
   */
  claimLeadership(): void {
    if (this.destroyed) return;

    this._isLeader = true;
    this.broadcastChannel?.postMessage({ type: "claim", tabId: this.tabId } satisfies TabMessage);
    this.startHeartbeat();
    this.notifyLeaderChange();
  }

  /**
   * Relay a message to all other tabs via BroadcastChannel.
   */
  relayMessage(data: unknown): void {
    this.broadcastChannel?.postMessage({ type: "relay", data } satisfies TabMessage);
  }

  /**
   * Register a callback for leader changes.
   */
  onLeaderChange(callback: (isLeader: boolean) => void): Unsubscribe {
    this.onLeaderChangeCallbacks.push(callback);
    return () => {
      this.onLeaderChangeCallbacks = this.onLeaderChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Register a callback for relayed messages from the leader tab.
   */
  onMessage(callback: (data: unknown) => void): Unsubscribe {
    this.onMessageCallbacks.push(callback);
    return () => {
      this.onMessageCallbacks = this.onMessageCallbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Clean up resources. Call on unmount.
   */
  destroy(): void {
    this.destroyed = true;
    if (this._isLeader) {
      this.broadcastChannel?.postMessage({ type: "resign", tabId: this.tabId } satisfies TabMessage);
    }
    this.stopHeartbeat();
    this.stopTimeout();
    this.broadcastChannel?.close();
    this.broadcastChannel = null;
    this.onLeaderChangeCallbacks = [];
    this.onMessageCallbacks = [];
  }

  private handleMessage(msg: TabMessage): void {
    if (this.destroyed) return;

    switch (msg.type) {
      case "heartbeat":
        if (msg.tabId !== this.tabId && this._isLeader) {
          // Another leader exists — stand down (older leader wins)
          // We check by tabId to avoid conflicts; the first claimer continues
        }
        if (msg.tabId !== this.tabId) {
          // Another tab is alive and leading — reset timeout
          this.resetTimeout();
          if (this._isLeader) {
            // Conflict resolution: yield to existing leader
            this._isLeader = false;
            this.stopHeartbeat();
            this.notifyLeaderChange();
          }
        }
        break;

      case "claim":
        if (msg.tabId !== this.tabId && this._isLeader) {
          // We are already leader — send heartbeat to assert
          this.broadcastChannel?.postMessage({ type: "heartbeat", tabId: this.tabId } satisfies TabMessage);
        }
        if (msg.tabId !== this.tabId && !this._isLeader) {
          // Another tab claimed leadership — reset timeout
          this.resetTimeout();
        }
        break;

      case "relay":
        if (!this._isLeader) {
          for (const cb of this.onMessageCallbacks) {
            cb(msg.data);
          }
        }
        break;

      case "resign":
        if (msg.tabId !== this.tabId) {
          // Leader resigned — try to claim
          this.claimLeadership();
        }
        break;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this._isLeader && !this.destroyed) {
        this.broadcastChannel?.postMessage({ type: "heartbeat", tabId: this.tabId } satisfies TabMessage);
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private resetTimeout(): void {
    this.stopTimeout();
    this.timeoutTimer = setTimeout(() => {
      if (!this._isLeader && !this.destroyed) {
        // No heartbeat received — promote self to leader
        this.claimLeadership();
      }
    }, this.heartbeatTimeout);
  }

  private stopTimeout(): void {
    if (this.timeoutTimer !== null) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }

  private notifyLeaderChange(): void {
    for (const cb of this.onLeaderChangeCallbacks) {
      cb(this._isLeader);
    }
  }
}

type Unsubscribe = () => void;
