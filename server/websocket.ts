import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";

type Channel = "satellites" | "flights" | "military" | "maritime" | "earthquakes" | "alerts" | "fires" | "conflicts" | "news";

interface ClientInfo {
    ws: WebSocket;
    channels: Set<Channel>;
    lastPing: number;
}

const clients = new Map<WebSocket, ClientInfo>();
let wss: WebSocketServer | null = null;

const HEARTBEAT_INTERVAL = 30_000;

export function initWebSocket(server: Server): WebSocketServer {
    wss = new WebSocketServer({ server, path: "/ws" });

    wss.on("connection", (ws) => {
        const info: ClientInfo = {
            ws,
            channels: new Set(),
            lastPing: Date.now(),
        };
        clients.set(ws, info);

        console.log(`[WS] Client connected (total: ${clients.size})`);

        ws.on("message", (raw) => {
            try {
                const msg = JSON.parse(raw.toString());

                if (msg.type === "subscribe" && msg.channel) {
                    info.channels.add(msg.channel as Channel);
                    ws.send(JSON.stringify({ type: "subscribed", channel: msg.channel }));
                }

                if (msg.type === "unsubscribe" && msg.channel) {
                    info.channels.delete(msg.channel as Channel);
                    ws.send(JSON.stringify({ type: "unsubscribed", channel: msg.channel }));
                }

                if (msg.type === "pong") {
                    info.lastPing = Date.now();
                }
            } catch {
                // Ignore malformed messages
            }
        });

        ws.on("close", () => {
            clients.delete(ws);
            console.log(`[WS] Client disconnected (total: ${clients.size})`);
        });

        ws.on("error", () => {
            clients.delete(ws);
        });

        // Send welcome
        ws.send(JSON.stringify({
            type: "connected",
            channels: ["satellites", "flights", "military", "maritime", "earthquakes", "alerts", "fires", "conflicts", "news"],
        }));
    });

    // Heartbeat
    setInterval(() => {
        const now = Date.now();
        for (const [ws, info] of clients) {
            if (now - info.lastPing > HEARTBEAT_INTERVAL * 2) {
                ws.terminate();
                clients.delete(ws);
                continue;
            }
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "ping", timestamp: now }));
            }
        }
    }, HEARTBEAT_INTERVAL);

    console.log("[WS] WebSocket server initialized on /ws");
    return wss;
}

export function broadcast(channel: Channel, data: unknown): void {
    const payload = JSON.stringify({ type: "data", channel, data, timestamp: Date.now() });

    for (const [ws, info] of clients) {
        if (info.channels.has(channel) && ws.readyState === WebSocket.OPEN) {
            ws.send(payload);
        }
    }
}

export function broadcastAlert(alert: unknown): void {
    broadcast("alerts", alert);
}

export function getConnectionStats() {
    const channelCounts: Record<string, number> = {};
    for (const [, info] of clients) {
        for (const ch of info.channels) {
            channelCounts[ch] = (channelCounts[ch] || 0) + 1;
        }
    }
    return { totalClients: clients.size, channelCounts };
}
