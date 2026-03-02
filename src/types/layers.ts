export type LayerId =
  | "satellites"
  | "flights"
  | "military"
  | "maritime"
  | "seismic"
  | "cctv"
  | "traffic"
  | "fires"
  | "conflicts"
  | "infrastructure"
  | "weather"
  | "nuclear"
  | "cyber"
  | "news";

export interface LayerConfig {
  id: LayerId;
  name: string;
  shortName: string;
  enabled: boolean;
  loading: boolean;
  entityCount: number;
  lastUpdate: number | null;
  color: string;
  keybind: string;
}

export type ThreatLevel = "critical" | "high" | "medium" | "low" | "info";

export interface Alert {
  id: string;
  timestamp: number;
  level: ThreatLevel;
  title: string;
  description: string;
  source: LayerId;
  lat?: number;
  lon?: number;
}

export type FeedStatus = "online" | "degraded" | "offline" | "stale";

export interface FeedHealth {
  feedId: string;
  status: FeedStatus;
  lastSuccessfulFetch: number | null;
  failureCount: number;
  latencyMs: number;
}
