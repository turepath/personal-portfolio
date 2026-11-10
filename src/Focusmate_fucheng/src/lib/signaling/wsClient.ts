import { SignalingClient, SignalEvent } from "./index";

export function createWebSocketSignalingClient(url: string, authToken?: string, userId?: string): SignalingClient {
  let ws: WebSocket | null = null;
  const subscribers = new Set<(e: SignalEvent) => void>();
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // 1秒

  const onMessage = (handler: (event: SignalEvent) => void) => {
    subscribers.add(handler);
  };

  const offMessage = (handler: (event: SignalEvent) => void) => {
    subscribers.delete(handler);
  };

  const connect = async () => {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
    
    try {
      const finalUrlBase = userId ? `${url}${url.includes("?") ? "&" : "?"}userId=${encodeURIComponent(userId)}` : url;
      const finalUrl = authToken ? `${finalUrlBase}${finalUrlBase.includes("?") ? "&" : "?"}token=${encodeURIComponent(authToken)}` : finalUrlBase;
      
      console.log(`[WebSocket] Connecting to ${finalUrl}`);
      ws = new WebSocket(finalUrl, authToken ? ["token", authToken] : undefined);
      
      ws.onopen = () => {
        console.log(`[WebSocket] Connected successfully`);
        reconnectAttempts = 0;
      };
      
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data as string) as SignalEvent;
          console.log(`[WebSocket] Received message:`, data.type);
          subscribers.forEach((fn) => fn(data));
        } catch (error) {
          console.error(`[WebSocket] Error parsing message:`, error);
        }
      };
      
      ws.onerror = (error) => {
        console.error(`[WebSocket] Connection error:`, error);
      };
      
      ws.onclose = (event) => {
        console.log(`[WebSocket] Connection closed: code=${event.code}, reason=${event.reason}`);
        ws = null;
        
        // 如果不是正常关闭，尝试重连
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`[WebSocket] Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
          reconnectTimeout = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectAttempts);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error(`[WebSocket] Max reconnection attempts reached`);
        }
      };
    } catch (error) {
      console.error(`[WebSocket] Connection failed:`, error);
    }
  };

  return {
    async connect() {
      await connect();
    },
    async disconnect() {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      if (!ws) return;
      try {
        ws.close(1000, "Client disconnect");
      } catch {}
      ws = null;
    },
    async send(event: SignalEvent) {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.warn(`[WebSocket] Cannot send message, connection not ready:`, ws?.readyState);
        return;
      }
      try {
        ws.send(JSON.stringify(event));
        console.log(`[WebSocket] Sent message:`, event.type);
      } catch (error) {
        console.error(`[WebSocket] Error sending message:`, error);
      }
    },
    onMessage,
    offMessage,
  };
}


