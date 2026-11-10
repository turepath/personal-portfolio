import { SignalingClient, SignalEvent } from "./index";

// Simple in-memory bus to simulate signaling in a single-tab demo
const subscribers = new Set<(e: SignalEvent) => void>();

export function createMockSignalingClient(): SignalingClient {
  let isConnected = false;

  const onMessage = (handler: (event: SignalEvent) => void) => {
    subscribers.add(handler);
  };

  const offMessage = (handler: (event: SignalEvent) => void) => {
    subscribers.delete(handler);
  };

  return {
    async connect() {
      isConnected = true;
    },
    async disconnect() {
      isConnected = false;
    },
    async send(event: SignalEvent) {
      if (!isConnected) return;
      // Broadcast to all listeners to mimic a server deliver
      subscribers.forEach((handler) => handler(event));
    },
    onMessage,
    offMessage,
  };
}


