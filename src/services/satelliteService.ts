const API_BASE = "/api";

interface TLERecord {
    name: string;
    line1: string;
    line2: string;
    noradId: number;
}

export async function fetchTLEs(group = "active"): Promise<TLERecord[]> {
    const resp = await fetch(`${API_BASE}/satellites/tle/${group}`);
    if (!resp.ok) throw new Error(`TLE fetch failed: ${resp.status}`);
    const text = await resp.text();
    return parseTLE(text);
}

function parseTLE(raw: string): TLERecord[] {
    const lines = raw.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    const records: TLERecord[] = [];

    for (let i = 0; i < lines.length - 2; i += 3) {
        const name = lines[i];
        const line1 = lines[i + 1];
        const line2 = lines[i + 2];

        if (!line1.startsWith("1 ") || !line2.startsWith("2 ")) continue;

        const noradId = parseInt(line1.substring(2, 7).trim(), 10);
        records.push({ name, line1, line2, noradId });
    }

    return records;
}

export function classifyOrbit(altKm: number): "LEO" | "MEO" | "GEO" | "HEO" {
    if (altKm < 2000) return "LEO";
    if (altKm < 35000) return "MEO";
    if (altKm < 36500) return "GEO";
    return "HEO";
}

export function getOrbitColor(orbit: string): string {
    switch (orbit) {
        case "LEO": return "#00ffff";
        case "MEO": return "#ffff00";
        case "GEO": return "#ff4444";
        case "HEO": return "#ff88ff";
        default: return "#ffffff";
    }
}

export type SatelliteCategory = "stations" | "starlink" | "gps-ops" | "weather" | "resource" | "military" | "science" | "active";

export const SATELLITE_CATEGORIES: { id: SatelliteCategory; label: string; group: string }[] = [
    { id: "active", label: "ALL ACTIVE", group: "active" },
    { id: "stations", label: "SPACE STATIONS", group: "stations" },
    { id: "starlink", label: "STARLINK", group: "starlink" },
    { id: "gps-ops", label: "GPS", group: "gps-ops" },
    { id: "weather", label: "WEATHER", group: "weather" },
    { id: "resource", label: "EARTH RESOURCES", group: "resource" },
    { id: "military", label: "MILITARY", group: "military" },
    { id: "science", label: "SCIENCE", group: "science" },
];

export async function fetchTLEsByCategory(category: SatelliteCategory): Promise<TLERecord[]> {
    return fetchTLEs(category);
}
