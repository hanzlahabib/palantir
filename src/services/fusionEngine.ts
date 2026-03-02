import type { TrackedEntity } from "@/types/entities";
import type { Alert, ThreatLevel } from "@/types/layers";
import { findNearbyHotspots } from "@/config/hotspots";
import { haversineDistance } from "@/utils/coordinateUtils";

export interface FusionEvent {
  id: string;
  type: string;
  level: ThreatLevel;
  title: string;
  description: string;
  lat: number;
  lon: number;
  entities: string[];
  timestamp: number;
}

interface EntityGroup {
  [layerId: string]: TrackedEntity[];
}

export function runFusionAnalysis(entities: TrackedEntity[]): FusionEvent[] {
  const events: FusionEvent[] = [];
  const grouped = groupByLayer(entities);

  // Rule 1: Military aircraft near conflict zones
  const military = grouped["military"] || [];
  const conflicts = grouped["conflicts"] || [];
  for (const mil of military) {
    for (const conf of conflicts) {
      const dist = haversineDistance(mil.lat, mil.lon, conf.lat, conf.lon);
      if (dist < 200_000) {
        events.push({
          id: `fusion-mil-conflict-${mil.id}-${conf.id}`,
          type: "military_near_conflict",
          level: "high",
          title: "MILITARY ACTIVITY NEAR CONFLICT ZONE",
          description: `${mil.name} detected ${(dist / 1000).toFixed(0)}km from active conflict in ${conf.name}`,
          lat: mil.lat,
          lon: mil.lon,
          entities: [mil.id, conf.id],
          timestamp: Date.now(),
        });
      }
    }
  }

  // Rule 2: Earthquake near nuclear facilities
  const seismic = grouped["seismic"] || [];
  for (const eq of seismic) {
    if ("magnitude" in eq && eq.magnitude >= 4.0) {
      const nearbyHotspots = findNearbyHotspots(eq.lat, eq.lon, 300);
      const nuclearNearby = nearbyHotspots.filter((h) => h.category === "nuclear");
      for (const nuke of nuclearNearby) {
        events.push({
          id: `fusion-eq-nuke-${eq.id}-${nuke.id}`,
          type: "seismic_near_nuclear",
          level: "critical",
          title: "SEISMIC EVENT NEAR NUCLEAR FACILITY",
          description: `M${eq.magnitude} earthquake near ${nuke.name}`,
          lat: eq.lat,
          lon: eq.lon,
          entities: [eq.id],
          timestamp: Date.now(),
        });
      }
    }
  }

  // Rule 3: Multiple data sources converging on location
  const allWithCoords = entities.filter((e) => e.lat && e.lon);
  const focalPoints = detectFocalPoints(allWithCoords);
  for (const fp of focalPoints) {
    events.push({
      id: `fusion-focal-${fp.lat.toFixed(2)}-${fp.lon.toFixed(2)}`,
      type: "focal_point",
      level: "medium",
      title: "MULTI-SOURCE CONVERGENCE DETECTED",
      description: `${fp.count} entities from ${fp.layers} layers converging at ${fp.lat.toFixed(2)}, ${fp.lon.toFixed(2)}`,
      lat: fp.lat,
      lon: fp.lon,
      entities: fp.entityIds,
      timestamp: Date.now(),
    });
  }

  return events;
}

function groupByLayer(entities: TrackedEntity[]): EntityGroup {
  const groups: EntityGroup = {};
  for (const entity of entities) {
    if (!groups[entity.layerId]) groups[entity.layerId] = [];
    groups[entity.layerId]!.push(entity);
  }
  return groups;
}

interface FocalPoint {
  lat: number;
  lon: number;
  count: number;
  layers: number;
  entityIds: string[];
}

function detectFocalPoints(entities: TrackedEntity[], radiusKm = 50): FocalPoint[] {
  const points: FocalPoint[] = [];
  const visited = new Set<string>();

  for (let i = 0; i < entities.length; i++) {
    const a = entities[i]!;
    if (visited.has(a.id)) continue;

    const nearby: TrackedEntity[] = [a];
    const layerSet = new Set([a.layerId]);

    for (let j = i + 1; j < entities.length; j++) {
      const b = entities[j]!;
      if (visited.has(b.id)) continue;
      const dist = haversineDistance(a.lat, a.lon, b.lat, b.lon);
      if (dist < radiusKm * 1000) {
        nearby.push(b);
        layerSet.add(b.layerId);
      }
    }

    if (nearby.length >= 5 && layerSet.size >= 2) {
      for (const e of nearby) visited.add(e.id);
      const avgLat = nearby.reduce((s, e) => s + e.lat, 0) / nearby.length;
      const avgLon = nearby.reduce((s, e) => s + e.lon, 0) / nearby.length;
      points.push({
        lat: avgLat,
        lon: avgLon,
        count: nearby.length,
        layers: layerSet.size,
        entityIds: nearby.map((e) => e.id),
      });
    }
  }

  return points;
}

export function fusionToAlert(event: FusionEvent): Alert {
  return {
    id: event.id,
    timestamp: event.timestamp,
    level: event.level,
    title: event.title,
    description: event.description,
    source: "conflicts",
    lat: event.lat,
    lon: event.lon,
  };
}
