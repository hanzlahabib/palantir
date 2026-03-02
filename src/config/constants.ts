export const APP_NAME = "PALANTIR";
export const APP_VERSION = "1.0.0";
export const APP_CLASSIFICATION = "UNCLASSIFIED // FOUO";

export const DEFAULT_CAMERA = {
  longitude: 0,
  latitude: 20,
  height: 20_000_000,
  heading: 0,
  pitch: -90,
  roll: 0,
} as const;

export const TILE_CONFIG = {
  maximumScreenSpaceError: 16,
  maximumMemoryUsage: 512,
  skipLevelOfDetail: true,
  dynamicScreenSpaceError: true,
} as const;

export const UPDATE_INTERVALS = {
  satellites: 1_000,       // 1s (SGP4 propagation)
  flights: 10_000,         // 10s
  military: 15_000,        // 15s
  maritime: 30_000,        // 30s (WebSocket push)
  seismic: 60_000,         // 1m
  fires: 900_000,          // 15m
  gdelt: 300_000,          // 5m
  cctv: 30_000,            // 30s
  conflicts: 3_600_000,    // 1h
  weather: 900_000,        // 15m
} as const;

export const VISUAL_MODE_KEYS: Record<string, string> = {
  "1": "standard",
  "2": "crt",
  "3": "nvg",
  "4": "flir",
  "5": "tactical",
};

export const BACKEND_URL = import.meta.env.DEV
  ? ""
  : window.location.origin;
