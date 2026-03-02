const API_BASE = "/api";

export interface Vessel {
  mmsi: string;
  name: string;
  lat: number;
  lon: number;
  speed: number;
  heading: number;
  vesselType: number;
  destination: string | null;
  flag: string | null;
  timestamp: number;
}

export type VesselCategory = "cargo" | "tanker" | "military" | "passenger" | "fishing" | "special" | "unknown";

export async function fetchVessels(): Promise<Vessel[]> {
  const resp = await fetch(`${API_BASE}/maritime`);
  if (!resp.ok) throw new Error(`Maritime fetch failed: ${resp.status}`);
  return resp.json();
}

export function classifyVessel(typeCode: number): VesselCategory {
  if (typeCode >= 70 && typeCode <= 79) return "cargo";
  if (typeCode >= 80 && typeCode <= 89) return "tanker";
  if (typeCode >= 35 && typeCode <= 39) return "military";
  if (typeCode >= 60 && typeCode <= 69) return "passenger";
  if (typeCode === 30) return "fishing";
  if (typeCode >= 50 && typeCode <= 59) return "special";
  return "unknown";
}

export function getVesselColor(category: VesselCategory): string {
  switch (category) {
    case "cargo": return "#888888";
    case "tanker": return "#ff6600";
    case "military": return "#ff0000";
    case "passenger": return "#4488ff";
    case "fishing": return "#00ff41";
    case "special": return "#ffff00";
    default: return "#666666";
  }
}

export function createAisWebSocket(
  onMessage: (vessel: Vessel) => void,
  onError?: (err: Event) => void
): WebSocket | null {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  try {
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", channel: "maritime" }));
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.channel === "maritime" && data.payload) {
          onMessage(data.payload as Vessel);
        }
      } catch { /* ignore parse errors */ }
    };
    ws.onerror = (err) => onError?.(err);
    return ws;
  } catch {
    return null;
  }
}
