const API_BASE = "/api";

export interface MilitaryFlight {
    hex: string;
    flight: string;
    lat: number;
    lon: number;
    alt_baro: number;
    gs: number;
    track: number;
    baro_rate: number;
    squawk: string | null;
    category: string;
    t: string; // aircraft type
    r: string; // registration
    dbFlags: number;
}

export async function fetchMilitaryFlights(): Promise<MilitaryFlight[]> {
    const resp = await fetch(`${API_BASE}/military`);
    if (!resp.ok) throw new Error(`Military fetch failed: ${resp.status}`);
    const data = await resp.json();
    return (data.ac || []).filter((a: MilitaryFlight) => a.lat != null && a.lon != null);
}
