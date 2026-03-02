const API_BASE = "/api";

export interface FireHotspot {
  lat: number;
  lon: number;
  brightness: number;
  frp: number;
  confidence: string;
  acqDate: string;
  satellite: string;
}

export async function fetchFires(): Promise<FireHotspot[]> {
  const resp = await fetch(`${API_BASE}/fires`);
  if (!resp.ok) throw new Error(`Fire fetch failed: ${resp.status}`);
  const data = await resp.json();
  return (data.fires || []).map((f: Record<string, unknown>) => ({
    lat: f.lat as number,
    lon: f.lon as number,
    brightness: (f.brightness as number) || 0,
    frp: (f.frp as number) || 0,
    confidence: (f.confidence as string) || "nominal",
    acqDate: (f.acq_date as string) || "",
    satellite: (f.satellite as string) || "VIIRS",
  }));
}

export function getFireIntensityColor(frp: number): string {
  if (frp > 100) return "#ff0000";
  if (frp > 50) return "#ff4400";
  if (frp > 20) return "#ff6600";
  return "#ff8800";
}

export function getFireSize(frp: number): number {
  return Math.min(Math.max(frp / 10, 4), 20);
}
