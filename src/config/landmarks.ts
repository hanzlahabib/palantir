export interface CameraPreset {
    name: string;
    lat: number;
    lon: number;
    height: number;
    heading: number;
    pitch: number;
    category: string;
    group: string;
}

export const LANDMARK_PRESETS: CameraPreset[] = [
    // Major Cities
    { name: "New York City", lat: 40.7128, lon: -74.006, height: 30000, heading: 0, pitch: -45, category: "city", group: "NYC" },
    { name: "Manhattan", lat: 40.7580, lon: -73.9855, height: 8000, heading: 30, pitch: -35, category: "landmark", group: "NYC" },
    { name: "London", lat: 51.5074, lon: -0.1278, height: 25000, heading: 0, pitch: -45, category: "city", group: "London" },
    { name: "Paris", lat: 48.8566, lon: 2.3522, height: 20000, heading: 0, pitch: -45, category: "city", group: "Paris" },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503, height: 25000, heading: 0, pitch: -45, category: "city", group: "Tokyo" },
    { name: "Dubai", lat: 25.2048, lon: 55.2708, height: 15000, heading: 20, pitch: -40, category: "city", group: "Dubai" },
    { name: "Moscow", lat: 55.7558, lon: 37.6173, height: 25000, heading: 0, pitch: -45, category: "city", group: "Moscow" },
    { name: "Beijing", lat: 39.9042, lon: 116.4074, height: 25000, heading: 0, pitch: -45, category: "city", group: "Beijing" },
    { name: "Washington DC", lat: 38.8977, lon: -77.0365, height: 20000, heading: 0, pitch: -45, category: "city", group: "DC" },
    { name: "Singapore", lat: 1.3521, lon: 103.8198, height: 15000, heading: 0, pitch: -45, category: "city", group: "Singapore" },
    { name: "Sydney", lat: -33.8688, lon: 151.2093, height: 20000, heading: 0, pitch: -45, category: "city", group: "Sydney" },

    // Strategic Locations
    { name: "Taiwan Strait", lat: 24.5, lon: 119.5, height: 200000, heading: 0, pitch: -60, category: "strategic", group: "Strategic" },
    { name: "Korean DMZ", lat: 38.0, lon: 127.0, height: 100000, heading: 0, pitch: -50, category: "strategic", group: "Strategic" },
    { name: "Persian Gulf", lat: 26.5, lon: 52.0, height: 300000, heading: 0, pitch: -60, category: "strategic", group: "Strategic" },
    { name: "South China Sea", lat: 15.0, lon: 115.0, height: 400000, heading: 0, pitch: -60, category: "strategic", group: "Strategic" },
    { name: "Suez Canal", lat: 30.5, lon: 32.3, height: 50000, heading: 0, pitch: -40, category: "strategic", group: "Strategic" },
    { name: "Bosphorus", lat: 41.1, lon: 29.0, height: 20000, heading: 180, pitch: -40, category: "strategic", group: "Strategic" },
    { name: "Gibraltar", lat: 36.1, lon: -5.35, height: 40000, heading: 90, pitch: -40, category: "strategic", group: "Strategic" },
    { name: "Black Sea", lat: 43.5, lon: 34.0, height: 300000, heading: 0, pitch: -60, category: "strategic", group: "Strategic" },
    { name: "Horn of Africa", lat: 11.5, lon: 43.1, height: 200000, heading: 0, pitch: -50, category: "strategic", group: "Strategic" },

    // Orbital View
    { name: "Orbital View", lat: 20, lon: 0, height: 20000000, heading: 0, pitch: -90, category: "orbital", group: "Orbital" },
];

export function getPresetGroups(): string[] {
    return [...new Set(LANDMARK_PRESETS.map((p) => p.group))];
}

export function getPresetsInGroup(group: string): CameraPreset[] {
    return LANDMARK_PRESETS.filter((p) => p.group === group);
}
