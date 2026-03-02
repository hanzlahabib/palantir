import { haversineDistance } from "@/utils/coordinateUtils";

interface SpatialEntity {
  id: string;
  lat: number;
  lon: number;
  layerId: string;
}

interface ProximityMatch {
  entityA: SpatialEntity;
  entityB: SpatialEntity;
  distanceKm: number;
}

// Grid-based spatial hash for efficient proximity detection
const CELL_SIZE_DEG = 0.5; // ~55km at equator

function getCellKey(lat: number, lon: number): string {
  const cellLat = Math.floor(lat / CELL_SIZE_DEG);
  const cellLon = Math.floor(lon / CELL_SIZE_DEG);
  return `${cellLat}:${cellLon}`;
}

function getNeighborCells(lat: number, lon: number): string[] {
  const cellLat = Math.floor(lat / CELL_SIZE_DEG);
  const cellLon = Math.floor(lon / CELL_SIZE_DEG);
  const cells: string[] = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      cells.push(`${cellLat + dy}:${cellLon + dx}`);
    }
  }
  return cells;
}

export function findProximities(
  entities: SpatialEntity[],
  thresholdKm: number,
  crossLayerOnly = true
): ProximityMatch[] {
  // Build spatial hash
  const grid = new Map<string, SpatialEntity[]>();
  for (const entity of entities) {
    const key = getCellKey(entity.lat, entity.lon);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(entity);
  }

  const matches: ProximityMatch[] = [];
  const checked = new Set<string>();

  for (const entity of entities) {
    const neighbors = getNeighborCells(entity.lat, entity.lon);
    for (const cellKey of neighbors) {
      const cellEntities = grid.get(cellKey);
      if (!cellEntities) continue;

      for (const other of cellEntities) {
        if (entity.id === other.id) continue;
        if (crossLayerOnly && entity.layerId === other.layerId) continue;

        const pairKey = [entity.id, other.id].sort().join(":");
        if (checked.has(pairKey)) continue;
        checked.add(pairKey);

        const dist = haversineDistance(entity.lat, entity.lon, other.lat, other.lon) / 1000;
        if (dist <= thresholdKm) {
          matches.push({
            entityA: entity,
            entityB: other,
            distanceKm: dist,
          });
        }
      }
    }
  }

  return matches.sort((a, b) => a.distanceKm - b.distanceKm);
}

export function findEntitiesNearPoint(
  entities: SpatialEntity[],
  lat: number,
  lon: number,
  radiusKm: number
): SpatialEntity[] {
  return entities.filter((e) => {
    const dist = haversineDistance(e.lat, e.lon, lat, lon) / 1000;
    return dist <= radiusKm;
  });
}
