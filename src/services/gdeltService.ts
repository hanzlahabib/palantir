const API_BASE = "/api";

export interface GdeltArticle {
    title: string;
    url: string;
    seendate: string;
    domain: string;
    language: string;
    sourcecountry: string;
}

export interface GdeltGeoEvent {
    lat: number;
    lon: number;
    name: string;
    count: number;
    articles: { title: string; url: string }[];
}

export async function fetchGdeltIntel(query = "conflict OR military"): Promise<GdeltArticle[]> {
    const resp = await fetch(`${API_BASE}/gdelt?q=${encodeURIComponent(query)}&mode=artlist&maxrecords=50`);
    if (!resp.ok) throw new Error(`GDELT fetch failed: ${resp.status}`);
    const data = await resp.json();
    return data.articles || [];
}

export async function fetchGdeltGeo(query = "conflict"): Promise<GdeltGeoEvent[]> {
    const resp = await fetch(`${API_BASE}/gdelt/geo?q=${encodeURIComponent(query)}`);
    if (!resp.ok) throw new Error(`GDELT GEO fetch failed: ${resp.status}`);
    const data = await resp.json();
    if (!data.features) return [];
    return data.features.map((f: any) => ({
        lat: f.geometry?.coordinates?.[1] || 0,
        lon: f.geometry?.coordinates?.[0] || 0,
        name: f.properties?.name || "",
        count: f.properties?.count || 0,
        articles: [],
    }));
}

export interface NewsArticle {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    source: string;
    tier: number;
}

export async function fetchNews(): Promise<{ source: string; articles: NewsArticle[] }[]> {
    const resp = await fetch(`${API_BASE}/news`);
    if (!resp.ok) throw new Error(`News fetch failed: ${resp.status}`);
    return resp.json();
}

export type ThreatLevel = "critical" | "high" | "medium" | "low" | "info";

const CRITICAL_KEYWORDS = ["nuclear", "strike", "invasion", "war declared", "missile launch", "chemical attack"];
const HIGH_KEYWORDS = ["explosion", "bombing", "military buildup", "sanctions", "cyber attack", "hostage"];
const MEDIUM_KEYWORDS = ["protest", "unrest", "tension", "deployment", "exercise", "escalation"];

export function classifyThreat(text: string): ThreatLevel {
    const lower = text.toLowerCase();
    if (CRITICAL_KEYWORDS.some((k) => lower.includes(k))) return "critical";
    if (HIGH_KEYWORDS.some((k) => lower.includes(k))) return "high";
    if (MEDIUM_KEYWORDS.some((k) => lower.includes(k))) return "medium";
    return "info";
}

export function getThreatColor(level: ThreatLevel): string {
    switch (level) {
        case "critical": return "#ff0000";
        case "high": return "#ff6600";
        case "medium": return "#ffaa00";
        case "low": return "#00ff41";
        case "info": return "#00ffff";
    }
}
