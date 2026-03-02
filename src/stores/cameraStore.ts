import { create } from "zustand";
import type { CameraState, VisualMode, DetectionDensity } from "@/types/globe";

interface CameraStore {
  camera: CameraState;
  visualMode: VisualMode;
  detectionDensity: DetectionDensity;
  isOrbiting: boolean;
  followingEntityId: string | null;
  setCamera: (state: Partial<CameraState>) => void;
  setVisualMode: (mode: VisualMode) => void;
  setDetectionDensity: (density: DetectionDensity) => void;
  toggleOrbit: () => void;
  setFollowingEntity: (id: string | null) => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  camera: {
    longitude: 0,
    latitude: 20,
    height: 20_000_000,
    heading: 0,
    pitch: -90,
    roll: 0,
  },
  visualMode: "standard",
  detectionDensity: "sparse",
  isOrbiting: false,
  followingEntityId: null,

  setCamera: (state) =>
    set((prev) => ({ camera: { ...prev.camera, ...state } })),

  setVisualMode: (mode) => set({ visualMode: mode }),

  setDetectionDensity: (density) => set({ detectionDensity: density }),

  toggleOrbit: () => set((state) => ({ isOrbiting: !state.isOrbiting })),

  setFollowingEntity: (id) => set({ followingEntityId: id }),
}));
