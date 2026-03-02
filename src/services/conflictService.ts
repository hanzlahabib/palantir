const API_BASE = "/api";

export interface ConflictEvent {
  id: string;
  eventDate: string;
  eventType: string;
  subEventType: string;
  country: string;
  region: string;
  lat: number;
  lon: number;
  fatalities: number;
  source: string;
  notes: string;
}

export type ConflictCategory = "battle" | "explosion" | "riot" | "protest" | "strategic" | "violence";

export async function fetchConflicts(): Promise<ConflictEvent[]> {
  const resp = await fetch(`${API_BASE}/conflicts`);
  if (!resp.ok) throw new Error(`Conflict fetch failed: ${resp.status}`);
  const data = await resp.json();
  return (data.events || data.data || []).map((e: Record<string, unknown>) => ({
    id: String(e.data_id || e.id || Math.random()),
    eventDate: (e.event_date as string) || "",
    eventType: (e.event_type as string) || "",
    subEventType: (e.sub_event_type as string) || "",
    country: (e.country as string) || "",
    region: (e.admin1 as string) || (e.region as string) || "",
    lat: Number(e.latitude || e.lat || 0),
    lon: Number(e.longitude || e.lon || 0),
    fatalities: Number(e.fatalities || 0),
    source: (e.source as string) || "",
    notes: (e.notes as string) || "",
  }));
}

export function classifyConflictType(eventType: string): ConflictCategory {
  const lower = eventType.toLowerCase();
  if (lower.includes("battle")) return "battle";
  if (lower.includes("explosion") || lower.includes("remote")) return "explosion";
  if (lower.includes("riot")) return "riot";
  if (lower.includes("protest")) return "protest";
  if (lower.includes("strategic")) return "strategic";
  return "violence";
}

export function getConflictColor(category: ConflictCategory): string {
  switch (category) {
    case "battle": return "#ff0000";
    case "explosion": return "#ff4400";
    case "riot": return "#ff8800";
    case "protest": return "#ffaa00";
    case "strategic": return "#ff6600";
    case "violence": return "#ff2222";
  }
}

export function getConflictSize(fatalities: number): number {
  if (fatalities === 0) return 6;
  if (fatalities < 5) return 8;
  if (fatalities < 20) return 12;
  if (fatalities < 100) return 16;
  return 22;
}
