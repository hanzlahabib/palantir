import { create } from "zustand";
import type { TrackedEntity } from "@/types/entities";

interface EntityStore {
  selectedEntity: TrackedEntity | null;
  hoveredEntityId: string | null;
  trackedEntities: Map<string, TrackedEntity>;
  selectEntity: (entity: TrackedEntity | null) => void;
  setHoveredEntity: (id: string | null) => void;
  upsertEntities: (entities: TrackedEntity[]) => void;
  removeEntitiesByLayer: (layerId: string) => void;
  getTrackedEntities: () => TrackedEntity[];
}

export const useEntityStore = create<EntityStore>((set, get) => ({
  selectedEntity: null,
  hoveredEntityId: null,
  trackedEntities: new Map(),
  selectEntity: (entity) => set({ selectedEntity: entity }),
  setHoveredEntity: (id) => set({ hoveredEntityId: id }),
  upsertEntities: (entities) =>
    set((state) => {
      const map = new Map(state.trackedEntities);
      for (const e of entities) map.set(e.id, e);
      return { trackedEntities: map };
    }),
  removeEntitiesByLayer: (layerId) =>
    set((state) => {
      const map = new Map(state.trackedEntities);
      for (const [id, e] of map) {
        if (e.layerId === layerId) map.delete(id);
      }
      return { trackedEntities: map };
    }),
  getTrackedEntities: () => [...get().trackedEntities.values()],
}));
