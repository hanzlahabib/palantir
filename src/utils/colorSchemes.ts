import * as Cesium from "cesium";

export const TACTICAL_COLORS = {
  bg: { primary: "#0a0a0a", secondary: "#111111", panel: "#0d0d0d" },
  border: { dim: "#1a1a1a", subtle: "#333333" },
  accent: { green: "#00ff41", amber: "#ff6600", cyan: "#00ffff" },
  alert: { red: "#ff0000", amber: "#ffaa00" },
  text: { primary: "#e0e0e0", secondary: "#666666", dim: "#444444" },
} as const;

export const CESIUM_COLORS = {
  green: Cesium.Color.fromCssColorString("#00ff41"),
  amber: Cesium.Color.fromCssColorString("#ff6600"),
  cyan: Cesium.Color.fromCssColorString("#00ffff"),
  red: Cesium.Color.fromCssColorString("#ff0000"),
  yellow: Cesium.Color.fromCssColorString("#ffaa00"),
  blue: Cesium.Color.fromCssColorString("#4488ff"),
  white: Cesium.Color.fromCssColorString("#e0e0e0"),
  dimWhite: Cesium.Color.fromCssColorString("#666666"),
} as const;

export function altitudeToColor(altMeters: number): Cesium.Color {
  if (altMeters < 3000) return Cesium.Color.fromCssColorString("#00ff41");
  if (altMeters < 8000) return Cesium.Color.fromCssColorString("#ffff00");
  if (altMeters < 12000) return Cesium.Color.fromCssColorString("#ff6600");
  return Cesium.Color.fromCssColorString("#ff0000");
}

export function magnitudeToColor(mag: number): Cesium.Color {
  if (mag < 2) return Cesium.Color.fromCssColorString("#00ff41");
  if (mag < 4) return Cesium.Color.fromCssColorString("#ffff00");
  if (mag < 5.5) return Cesium.Color.fromCssColorString("#ff6600");
  if (mag < 7) return Cesium.Color.fromCssColorString("#ff4400");
  return Cesium.Color.fromCssColorString("#ff0000");
}

export function threatLevelToColor(level: string): string {
  switch (level) {
    case "critical": return "#ff0000";
    case "high": return "#ff6600";
    case "medium": return "#ffaa00";
    case "low": return "#00ff41";
    case "info": return "#00ffff";
    default: return "#666666";
  }
}
