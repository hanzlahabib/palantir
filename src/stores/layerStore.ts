import { create } from "zustand";
import type { LayerConfig, LayerId } from "@/types/layers";

const DEFAULT_LAYERS: LayerConfig[] = [
  { id: "satellites", name: "Satellite Tracking", shortName: "SAT", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#00ffff", keybind: "F1" },
  { id: "flights", name: "Commercial Aviation", shortName: "FLT", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#00ff41", keybind: "F2" },
  { id: "military", name: "Military Aviation", shortName: "MIL", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#ff6600", keybind: "F3" },
  { id: "maritime", name: "Maritime Tracking", shortName: "SEA", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#4488ff", keybind: "F4" },
  { id: "seismic", name: "Seismic Activity", shortName: "EQ", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#ff4444", keybind: "F5" },
  { id: "cctv", name: "CCTV Surveillance", shortName: "CAM", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#aaaaaa", keybind: "F6" },
  { id: "traffic", name: "Street Traffic", shortName: "TFC", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#ffff00", keybind: "F7" },
  { id: "fires", name: "Wildfire/FIRMS", shortName: "FIR", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#ff4400", keybind: "F8" },
  { id: "conflicts", name: "Conflict Zones", shortName: "WAR", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#ff0000", keybind: "F9" },
  { id: "infrastructure", name: "Infrastructure", shortName: "INF", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#888888", keybind: "F10" },
  { id: "news", name: "News Intelligence", shortName: "INT", enabled: false, loading: false, entityCount: 0, lastUpdate: null, color: "#ff6600", keybind: "F11" },
];

interface LayerStore {
  layers: LayerConfig[];
  toggleLayer: (id: LayerId) => void;
  setLayerLoading: (id: LayerId, loading: boolean) => void;
  updateEntityCount: (id: LayerId, count: number) => void;
  updateLastFetch: (id: LayerId) => void;
  getLayer: (id: LayerId) => LayerConfig | undefined;
  getEnabledLayers: () => LayerConfig[];
  getTotalEntityCount: () => number;
  getOnlineFeedCount: () => number;
}

export const useLayerStore = create<LayerStore>((set, get) => ({
  layers: DEFAULT_LAYERS,

  toggleLayer: (id) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, enabled: !l.enabled } : l
      ),
    })),

  setLayerLoading: (id, loading) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, loading } : l
      ),
    })),

  updateEntityCount: (id, count) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, entityCount: count } : l
      ),
    })),

  updateLastFetch: (id) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, lastUpdate: Date.now() } : l
      ),
    })),

  getLayer: (id) => get().layers.find((l) => l.id === id),

  getEnabledLayers: () => get().layers.filter((l) => l.enabled),

  getTotalEntityCount: () =>
    get().layers.reduce((sum, l) => sum + l.entityCount, 0),

  getOnlineFeedCount: () =>
    get().layers.filter((l) => l.enabled && l.lastUpdate !== null).length,
}));
