import { create } from "zustand";
import type { TrackedEntity } from "@/types/entities";

interface EntityStore {
  selectedEntity: TrackedEntity | null;
  hoveredEntityId: string | null;
  selectEntity: (entity: TrackedEntity | null) => void;
  setHoveredEntity: (id: string | null) => void;
}

export const useEntityStore = create<EntityStore>((set) => ({
  selectedEntity: null,
  hoveredEntityId: null,
  selectEntity: (entity) => set({ selectedEntity: entity }),
  setHoveredEntity: (id) => set({ hoveredEntityId: id }),
}));
