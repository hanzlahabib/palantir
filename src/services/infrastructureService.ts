const API_BASE = "/api";

export interface InfrastructureAsset {
  id: string;
  name: string;
  type: "military_base" | "nuclear" | "submarine_cable" | "pipeline" | "data_center" | "port";
  lat: number;
  lon: number;
  country: string;
  operator?: string;
  status?: string;
  details?: string;
}

export interface SubmarineCable {
  id: string;
  name: string;
  coordinates: [number, number][];
  owners: string;
  length: string;
  rfs: string;
}

export async function fetchSubmarineCables(): Promise<SubmarineCable[]> {
  const resp = await fetch(
    "https://raw.githubusercontent.com/telegeography/www.submarinecablemap.com/master/web/public/api/v3/cable/cable-geo.json"
  );
  if (!resp.ok) throw new Error(`Submarine cable fetch failed: ${resp.status}`);
  const data = await resp.json();
  return (data.features || []).slice(0, 200).map((f: Record<string, unknown>) => {
    const props = f.properties as Record<string, unknown>;
    const geom = f.geometry as { coordinates: [number, number][] };
    return {
      id: String(props.id || props.name),
      name: (props.name as string) || "Unknown Cable",
      coordinates: geom.coordinates || [],
      owners: (props.owners as string) || "",
      length: (props.length as string) || "",
      rfs: (props.rfs as string) || "",
    };
  });
}

export async function fetchOverpassInfrastructure(
  bbox: { south: number; west: number; north: number; east: number },
  query: string
): Promise<InfrastructureAsset[]> {
  const resp = await fetch(`${API_BASE}/traffic?bbox=${bbox.south},${bbox.west},${bbox.north},${bbox.east}&query=${encodeURIComponent(query)}`);
  if (!resp.ok) return [];
  return resp.json();
}

export function getInfrastructureColor(type: InfrastructureAsset["type"]): string {
  switch (type) {
    case "military_base": return "#ff6600";
    case "nuclear": return "#ff0000";
    case "submarine_cable": return "#00ffff";
    case "pipeline": return "#ffaa00";
    case "data_center": return "#4488ff";
    case "port": return "#00ff41";
  }
}

export function getInfrastructureIcon(type: InfrastructureAsset["type"]): string {
  switch (type) {
    case "military_base": return "★";
    case "nuclear": return "☢";
    case "submarine_cable": return "≈";
    case "pipeline": return "═";
    case "data_center": return "▦";
    case "port": return "⚓";
  }
}
