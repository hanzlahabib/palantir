import type { Viewer, Cartesian3 } from "cesium";

export type VisualMode = "standard" | "crt" | "nvg" | "flir" | "tactical";

export type DetectionDensity = "sparse" | "dense";

export interface CameraState {
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
}

export interface CameraPreset {
  id: string;
  name: string;
  lat: number;
  lon: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
  duration: number;
  category: "city" | "landmark" | "hotspot" | "strategic";
}

export interface GlobeViewerRef {
  viewer: Viewer | null;
  flyTo: (preset: CameraPreset) => void;
  getCurrentCamera: () => CameraState;
}

export interface ViewerConfig {
  googleApiKey: string;
  enableAtmosphere: boolean;
  enableLighting: boolean;
  maxTileMemoryMB: number;
  msaaSamples: number;
}

export interface ScreenCoordinate {
  x: number;
  y: number;
}

export interface GeoPosition {
  longitude: number;
  latitude: number;
  altitude: number;
}

export interface CartesianPosition {
  position: Cartesian3;
}
