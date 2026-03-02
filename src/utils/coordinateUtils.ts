import * as Cesium from "cesium";

export function cartesianToGeo(cartesian: Cesium.Cartesian3): {
  longitude: number;
  latitude: number;
  altitude: number;
} {
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
  return {
    longitude: Cesium.Math.toDegrees(cartographic.longitude),
    latitude: Cesium.Math.toDegrees(cartographic.latitude),
    altitude: cartographic.height,
  };
}

export function geoToCartesian(
  lon: number,
  lat: number,
  alt = 0
): Cesium.Cartesian3 {
  return Cesium.Cartesian3.fromDegrees(lon, lat, alt);
}

export function formatCoordinate(value: number, isLat: boolean): string {
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = Math.floor((abs - deg) * 60);
  const sec = ((abs - deg - min / 60) * 3600).toFixed(1);
  const dir = isLat
    ? value >= 0 ? "N" : "S"
    : value >= 0 ? "E" : "W";
  return `${deg}°${min}'${sec}"${dir}`;
}

export function formatAltitude(meters: number): string {
  if (meters >= 1_000_000) return `${(meters / 1_000_000).toFixed(1)}M m`;
  if (meters >= 1_000) return `${(meters / 1_000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

export function formatHeading(degrees: number): string {
  const normalized = ((degrees % 360) + 360) % 360;
  return `${normalized.toFixed(1)}°`;
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
