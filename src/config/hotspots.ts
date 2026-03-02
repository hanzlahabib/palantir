export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radius: number;
  baselineThreat: number;
  category: "conflict" | "nuclear" | "maritime" | "cyber" | "political";
}

export const HOTSPOTS: Hotspot[] = [
  { id: "ukraine", name: "Ukraine / Donbas", lat: 48.0, lon: 37.8, radius: 500, baselineThreat: 85, category: "conflict" },
  { id: "taiwan-strait", name: "Taiwan Strait", lat: 24.0, lon: 119.5, radius: 300, baselineThreat: 60, category: "maritime" },
  { id: "south-china-sea", name: "South China Sea", lat: 12.0, lon: 114.0, radius: 800, baselineThreat: 55, category: "maritime" },
  { id: "korean-dmz", name: "Korean DMZ", lat: 38.0, lon: 127.0, radius: 200, baselineThreat: 50, category: "conflict" },
  { id: "persian-gulf", name: "Persian Gulf / Hormuz", lat: 26.5, lon: 54.0, radius: 400, baselineThreat: 45, category: "maritime" },
  { id: "israel-gaza", name: "Israel / Gaza", lat: 31.4, lon: 34.4, radius: 150, baselineThreat: 80, category: "conflict" },
  { id: "yemen-red-sea", name: "Yemen / Red Sea", lat: 14.0, lon: 42.5, radius: 500, baselineThreat: 70, category: "maritime" },
  { id: "kashmir", name: "Kashmir LoC", lat: 34.0, lon: 75.0, radius: 300, baselineThreat: 40, category: "conflict" },
  { id: "sahel", name: "Sahel Region", lat: 15.0, lon: 0.0, radius: 1000, baselineThreat: 55, category: "conflict" },
  { id: "horn-of-africa", name: "Horn of Africa", lat: 8.0, lon: 46.0, radius: 600, baselineThreat: 50, category: "conflict" },
  { id: "venezuela", name: "Venezuela", lat: 8.0, lon: -66.0, radius: 400, baselineThreat: 30, category: "political" },
  { id: "myanmar", name: "Myanmar", lat: 19.0, lon: 96.0, radius: 500, baselineThreat: 60, category: "conflict" },
  { id: "arctic", name: "Arctic / Northern Sea Route", lat: 75.0, lon: 100.0, radius: 1500, baselineThreat: 25, category: "maritime" },
  { id: "suez-canal", name: "Suez Canal", lat: 30.5, lon: 32.3, radius: 100, baselineThreat: 35, category: "maritime" },
  { id: "bosphorus", name: "Bosphorus Strait", lat: 41.1, lon: 29.0, radius: 50, baselineThreat: 30, category: "maritime" },
  { id: "gibraltar", name: "Strait of Gibraltar", lat: 35.9, lon: -5.5, radius: 80, baselineThreat: 20, category: "maritime" },
];

export function findNearbyHotspots(lat: number, lon: number, maxDistKm = 500): Hotspot[] {
  return HOTSPOTS.filter((h) => {
    const R = 6371;
    const dLat = ((h.lat - lat) * Math.PI) / 180;
    const dLon = ((h.lon - lon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) * Math.cos((h.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist <= maxDistKm;
  });
}
