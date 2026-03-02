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

export interface NaturalEvent {
    id: string;
    title: string;
    category: string;
    lat: number;
    lon: number;
    date: string;
    source: string;
}

export async function fetchNaturalEvents(): Promise<NaturalEvent[]> {
    const resp = await fetch(`${API_BASE}/natural-events`);
    if (!resp.ok) throw new Error(`EONET fetch failed: ${resp.status}`);
    const data = await resp.json();
    if (!Array.isArray(data.events)) return [];
    return data.events
        .filter((e: any) => e.geometry?.length > 0)
        .map((e: any): NaturalEvent => {
            const geo = e.geometry[e.geometry.length - 1];
            return {
                id: e.id,
                title: e.title,
                category: e.categories?.[0]?.title || "Unknown",
                lat: geo.coordinates?.[1] || 0,
                lon: geo.coordinates?.[0] || 0,
                date: geo.date || "",
                source: e.sources?.[0]?.url || "",
            };
        })
        .filter((e: NaturalEvent) => e.lat !== 0 && e.lon !== 0);
}

export function getNaturalEventColor(category: string): string {
    switch (category.toLowerCase()) {
        case "wildfires": return "#ff4400";
        case "severe storms": return "#8844ff";
        case "volcanoes": return "#ff0044";
        case "floods": return "#0088ff";
        case "sea and lake ice": return "#00ccff";
        case "earthquakes": return "#ffaa00";
        default: return "#ffffff";
    }
}
