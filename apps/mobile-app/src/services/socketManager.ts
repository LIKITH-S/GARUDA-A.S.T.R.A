/**
 * Socket Manager — Persistent WebSocket singleton for Garuda A.S.T.R.A
 *
 * Global singleton that manages the WebSocket connection independently
 * of React component lifecycle. Designed to run INSIDE the foreground
 * service background loop so it survives app backgrounding.
 *
 * Features:
 * - Exponential backoff reconnect (1s → 2s → 4s → ... → 30s max)
 * - Heartbeat ping every 25s to keep connection alive through NAT/doze
 * - Event-based message dispatch (decoupled from React)
 * - ensureConnected() called every tick from the foreground service
 *
 * When backend is ready: just change WS_URL. No other code changes needed.
 */

type MessageHandler = (data: any) => void;
type ConnectionHandler = (connected: boolean) => void;

// ---------- Configuration ----------

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const HEARTBEAT_INTERVAL_MS = 25000;
const CONNECTION_TIMEOUT_MS = 10000;

// ---------- Singleton State ----------

let wsInstance: WebSocket | null = null;
let wsUrl: string | null = null;
let connected = false;
let intentionalDisconnect = false;
let reconnectAttempts = 0;
let reconnectTimer: NodeJS.Timeout | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;
let connectionTimeoutTimer: NodeJS.Timeout | null = null;

// Event handlers (multiple listeners supported)
const messageHandlers: Set<MessageHandler> = new Set();
const connectionHandlers: Set<ConnectionHandler> = new Set();

// ---------- Internal Helpers ----------

function getReconnectDelay(): number {
  const delay = Math.min(
    RECONNECT_BASE_MS * Math.pow(2, reconnectAttempts),
    RECONNECT_MAX_MS
  );
  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

function notifyConnectionChange(state: boolean) {
  connected = state;
  connectionHandlers.forEach((handler) => {
    try {
      handler(state);
    } catch (err) {
      console.error('[SOCKET] Connection handler error:', err);
    }
  });
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      try {
        wsInstance.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      } catch {
        // Connection may have died — ensureConnected() will handle it
      }
    }
  }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function clearConnectionTimeout() {
  if (connectionTimeoutTimer) {
    clearTimeout(connectionTimeoutTimer);
    connectionTimeoutTimer = null;
  }
}

function scheduleReconnect() {
  if (intentionalDisconnect) return;
  clearReconnectTimer();

  const delay = getReconnectDelay();
  reconnectAttempts++;

  console.log(`🔄 [SOCKET] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})...`);

  reconnectTimer = setTimeout(() => {
    if (!intentionalDisconnect && wsUrl) {
      createConnection(wsUrl);
    }
  }, delay);
}

function createConnection(url: string) {
  // Clean up any existing connection
  destroyConnection();

  try {
    wsInstance = new WebSocket(url);

    // Connection timeout — if we don't connect within 10s, retry
    connectionTimeoutTimer = setTimeout(() => {
      if (wsInstance && wsInstance.readyState !== WebSocket.OPEN) {
        console.warn('⚠️ [SOCKET] Connection timeout. Retrying...');
        wsInstance.close();
      }
    }, CONNECTION_TIMEOUT_MS);

    wsInstance.onopen = () => {
      clearConnectionTimeout();
      reconnectAttempts = 0;
      notifyConnectionChange(true);
      startHeartbeat();
      console.log(`✅ [SOCKET] Connected to ${url}`);
    };

    wsInstance.onmessage = (event: WebSocketMessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        // Ignore pong responses
        if (data.type === 'pong') return;

        messageHandlers.forEach((handler) => {
          try {
            handler(data);
          } catch (err) {
            console.error('[SOCKET] Message handler error:', err);
          }
        });
      } catch (parseError) {
        console.error('❌ [SOCKET] Failed to parse message:', parseError);
      }
    };

    wsInstance.onerror = (error: Event) => {
      console.error('❌ [SOCKET] Connection error:', error);
    };

    wsInstance.onclose = () => {
      clearConnectionTimeout();
      stopHeartbeat();

      if (connected) {
        notifyConnectionChange(false);
      }

      if (!intentionalDisconnect) {
        console.log('🔌 [SOCKET] Connection lost. Will reconnect...');
        scheduleReconnect();
      }
    };
  } catch (error) {
    console.error('❌ [SOCKET] Failed to create WebSocket:', error);
    scheduleReconnect();
  }
}

function destroyConnection() {
  clearConnectionTimeout();
  stopHeartbeat();

  if (wsInstance) {
    // Remove handlers to prevent reconnect triggers
    wsInstance.onopen = null;
    wsInstance.onmessage = null;
    wsInstance.onerror = null;
    wsInstance.onclose = null;

    try {
      if (wsInstance.readyState === WebSocket.OPEN ||
          wsInstance.readyState === WebSocket.CONNECTING) {
        wsInstance.close();
      }
    } catch {
      // Ignore close errors
    }

    wsInstance = null;
  }
}

// ---------- Public API ----------

/**
 * Connect to the WebSocket server.
 * Safe to call multiple times — only connects if not already connected.
 */
export function connect(url: string): void {
  wsUrl = url;
  intentionalDisconnect = false;
  reconnectAttempts = 0;

  if (connected && wsInstance?.readyState === WebSocket.OPEN) {
    console.log('ℹ️ [SOCKET] Already connected.');
    return;
  }

  console.log(`🔌 [SOCKET] Connecting to ${url}...`);
  createConnection(url);
}

/**
 * Disconnect from the WebSocket server.
 * Stops reconnect attempts and cleans up all timers.
 */
export function disconnect(): void {
  intentionalDisconnect = true;
  clearReconnectTimer();
  destroyConnection();
  notifyConnectionChange(false);
  wsUrl = null;
  reconnectAttempts = 0;
  console.log('🔌 [SOCKET] Disconnected intentionally.');
}

/**
 * Called every tick from the foreground service loop.
 * If the connection is dead, attempts to reconnect immediately.
 */
export function ensureConnected(): void {
  if (intentionalDisconnect || !wsUrl) return;

  if (!wsInstance || wsInstance.readyState === WebSocket.CLOSED) {
    // Connection is dead — reconnect now
    if (!reconnectTimer) {
      console.log('🔄 [SOCKET] Connection dead. Reconnecting from service loop...');
      createConnection(wsUrl);
    }
  }
}

/**
 * Check if the WebSocket is currently connected.
 */
export function isConnected(): boolean {
  return connected && wsInstance?.readyState === WebSocket.OPEN;
}

/**
 * Send data to the WebSocket server (e.g., telemetry).
 * Silently drops if not connected.
 */
export function send(data: object): void {
  if (!wsInstance || wsInstance.readyState !== WebSocket.OPEN) {
    // Not connected — drop silently (telemetry is fire-and-forget)
    return;
  }
  try {
    wsInstance.send(JSON.stringify(data));
  } catch (err) {
    console.warn('⚠️ [SOCKET] Send failed:', err);
  }
}

/**
 * Register a handler for incoming messages.
 * Returns an unsubscribe function.
 */
export function onMessage(handler: MessageHandler): () => void {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

/**
 * Register a handler for connection state changes.
 * Returns an unsubscribe function.
 */
export function onConnectionChange(handler: ConnectionHandler): () => void {
  connectionHandlers.add(handler);
  return () => connectionHandlers.delete(handler);
}

/**
 * Get the current WebSocket URL (for diagnostics).
 */
export function getUrl(): string | null {
  return wsUrl;
}
