const API_BASE = "/api";

export interface FlightState {
    icao24: string;
    callsign: string;
    originCountry: string;
    lat: number;
    lon: number;
    altitude: number;
    velocity: number;
    heading: number;
    verticalRate: number;
    onGround: boolean;
    squawk: string | null;
    isEmergency: boolean;
}

export async function fetchFlights(bbox?: { lamin: number; lamax: number; lomin: number; lomax: number }): Promise<FlightState[]> {
    let url = `${API_BASE}/flights`;
    if (bbox) {
        const params = new URLSearchParams({
            lamin: String(bbox.lamin),
            lamax: String(bbox.lamax),
            lomin: String(bbox.lomin),
            lomax: String(bbox.lomax),
        });
        url += `?${params}`;
    }

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Flight fetch failed: ${resp.status}`);
    const data = await resp.json();

    if (!data.states) return [];

    return data.states
        .filter((s: unknown[]) => s[6] != null && s[5] != null)
        .map((s: unknown[]): FlightState => {
            const squawk = s[14] as string | null;
            return {
                icao24: (s[0] as string) || "",
                callsign: ((s[1] as string) || "").trim(),
                originCountry: (s[2] as string) || "",
                lat: s[6] as number,
                lon: s[5] as number,
                altitude: (s[13] as number) || (s[7] as number) || 0,
                velocity: (s[9] as number) || 0,
                heading: (s[10] as number) || 0,
                verticalRate: (s[11] as number) || 0,
                onGround: (s[8] as boolean) || false,
                squawk,
                isEmergency: squawk === "7500" || squawk === "7600" || squawk === "7700",
            };
        });
}

export function getAltitudeColor(altMeters: number): string {
    if (altMeters < 3000) return "#44ff44";
    if (altMeters < 10000) return "#ffff44";
    return "#ff4444";
}

export function getSquawkAlert(squawk: string | null): { level: string; message: string } | null {
    if (!squawk) return null;
    switch (squawk) {
        case "7500": return { level: "critical", message: "HIJACKING" };
        case "7600": return { level: "high", message: "RADIO FAILURE" };
        case "7700": return { level: "critical", message: "EMERGENCY" };
        default: return null;
    }
}
