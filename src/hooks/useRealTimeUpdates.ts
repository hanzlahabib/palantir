import { useEffect, useRef, useCallback, useState } from "react";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface UseRealTimeUpdatesOptions {
  channels: string[];
  enabled: boolean;
  onMessage: (channel: string, payload: unknown) => void;
  reconnectIntervalMs?: number;
  maxReconnectAttempts?: number;
}

export function useRealTimeUpdates({
  channels,
  enabled,
  onMessage,
  reconnectIntervalMs = 5000,
  maxReconnectAttempts = 10,
}: UseRealTimeUpdatesOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => {
      setStatus("connected");
      reconnectAttemptsRef.current = 0;
      for (const channel of channels) {
        ws.send(JSON.stringify({ type: "subscribe", channel }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "heartbeat") return;
        if (data.channel && data.payload) {
          onMessage(data.channel, data.payload);
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;
      if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = reconnectIntervalMs * Math.pow(1.5, reconnectAttemptsRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, Math.min(delay, 60_000));
      }
    };
  }, [channels, enabled, onMessage, reconnectIntervalMs, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }
    return disconnect;
  }, [enabled, connect, disconnect]);

  return { status, disconnect };
}
