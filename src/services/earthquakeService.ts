const API_BASE = "/api";

export interface EarthquakeFeature {
    id: string;
    lat: number;
    lon: number;
    depth: number;
    magnitude: number;
    place: string;
    time: number;
    type: string;
    tsunami: boolean;
    url: string;
}

export async function fetchEarthquakes(feed = "all_day"): Promise<EarthquakeFeature[]> {
    const resp = await fetch(`${API_BASE}/earthquakes?feed=${feed}`);
    if (!resp.ok) throw new Error(`Earthquake fetch failed: ${resp.status}`);
    const data = await resp.json();

    if (!data.features) return [];

    return data.features.map((f: any): EarthquakeFeature => ({
        id: f.id,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        depth: f.geometry.coordinates[2],
        magnitude: f.properties.mag || 0,
        place: f.properties.place || "Unknown",
        time: f.properties.time,
        type: f.properties.type || "earthquake",
        tsunami: !!f.properties.tsunami,
        url: f.properties.url || "",
    }));
}

export function getMagnitudeSize(mag: number): number {
    if (mag < 1) return 4;
    if (mag < 3) return 8;
    if (mag < 5) return 16;
    if (mag < 7) return 30;
    return 50;
}

export function getDepthColor(depthKm: number): string {
    if (depthKm < 70) return "#ff4444";    // Shallow - red
    if (depthKm < 300) return "#ff8800";   // Intermediate - orange
    return "#ffff44";                       // Deep - yellow
}

export interface FireHotspot {
    lat: number;
    lon: number;
    frp: number;
    date: string;
}

export async function fetchFires(): Promise<FireHotspot[]> {
    const resp = await fetch(`${API_BASE}/fires`);
    if (!resp.ok) throw new Error(`Fires fetch failed: ${resp.status}`);
    return resp.json();
}
