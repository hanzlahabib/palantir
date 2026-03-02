const API_BASE = "/api";

export interface CameraFeed {
  id: string;
  name: string;
  lat: number;
  lon: number;
  city: string;
  imageUrl: string;
  lastUpdate: number;
}

export interface CityInfo {
  id: string;
  name: string;
  cameraCount: number;
}

export async function fetchCities(): Promise<CityInfo[]> {
  const resp = await fetch(`${API_BASE}/cctv/cities`);
  if (!resp.ok) throw new Error(`CCTV cities fetch failed: ${resp.status}`);
  return resp.json();
}

export async function fetchCameras(city: string): Promise<CameraFeed[]> {
  const resp = await fetch(`${API_BASE}/cctv/${city}`);
  if (!resp.ok) throw new Error(`CCTV fetch failed: ${resp.status}`);
  const data = await resp.json();
  return (data.cameras || []).map((cam: Record<string, unknown>) => ({
    id: cam.id || `${city}-${cam.name}`,
    name: cam.name as string,
    lat: cam.lat as number,
    lon: cam.lon as number,
    city,
    imageUrl: cam.imageUrl as string,
    lastUpdate: Date.now(),
  }));
}

export function getCameraRefreshUrl(baseUrl: string): string {
  return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
}
