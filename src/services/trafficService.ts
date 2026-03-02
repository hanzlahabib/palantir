const API_BASE = "/api";

export interface RoadSegment {
  id: string;
  roadClass: "motorway" | "trunk" | "primary" | "secondary" | "tertiary";
  coordinates: [number, number][];
  name?: string;
}

export interface TrafficParticle {
  segmentId: string;
  position: number;
  speed: number;
  lat: number;
  lon: number;
}

export async function fetchRoads(bbox: {
  south: number;
  west: number;
  north: number;
  east: number;
}): Promise<RoadSegment[]> {
  const resp = await fetch(
    `${API_BASE}/traffic?bbox=${bbox.south},${bbox.west},${bbox.north},${bbox.east}`
  );
  if (!resp.ok) throw new Error(`Traffic fetch failed: ${resp.status}`);
  const data = await resp.json();
  return (data.roads || data.elements || []).map((r: Record<string, unknown>, i: number) => ({
    id: String(r.id || i),
    roadClass: (r.roadClass as string) || "primary",
    coordinates: (r.coordinates as [number, number][]) || [],
    name: r.name as string | undefined,
  }));
}

export function getRoadSpeed(roadClass: RoadSegment["roadClass"]): number {
  switch (roadClass) {
    case "motorway": return 120;
    case "trunk": return 100;
    case "primary": return 70;
    case "secondary": return 50;
    case "tertiary": return 35;
  }
}

export function getRoadColor(roadClass: RoadSegment["roadClass"]): string {
  switch (roadClass) {
    case "motorway": return "#ffff00";
    case "trunk": return "#ffcc00";
    case "primary": return "#ffaa00";
    case "secondary": return "#ff8800";
    case "tertiary": return "#ff6600";
  }
}

export function getRoadDensity(roadClass: RoadSegment["roadClass"]): number {
  switch (roadClass) {
    case "motorway": return 15;
    case "trunk": return 10;
    case "primary": return 6;
    case "secondary": return 3;
    case "tertiary": return 1;
  }
}

export function interpolateAlongSegment(
  coords: [number, number][],
  t: number
): { lat: number; lon: number } {
  if (coords.length < 2) return { lon: coords[0]?.[0] ?? 0, lat: coords[0]?.[1] ?? 0 };
  const totalSegments = coords.length - 1;
  const segIndex = Math.min(Math.floor(t * totalSegments), totalSegments - 1);
  const segT = (t * totalSegments) - segIndex;
  const p0 = coords[segIndex]!;
  const p1 = coords[segIndex + 1]!;
  return {
    lon: p0[0] + (p1[0] - p0[0]) * segT,
    lat: p0[1] + (p1[1] - p0[1]) * segT,
  };
}
