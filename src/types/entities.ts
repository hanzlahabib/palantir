import type { LayerId, ThreatLevel } from "./layers";

export interface BaseEntity {
  id: string;
  layerId: LayerId;
  lat: number;
  lon: number;
  alt?: number;
  name: string;
  timestamp: number;
}

export interface SatelliteEntity extends BaseEntity {
  layerId: "satellites";
  noradId: number;
  orbitType: "LEO" | "MEO" | "GEO" | "HEO";
  category: string;
  tle1: string;
  tle2: string;
  velocity?: number;
  period?: number;
}

export interface FlightEntity extends BaseEntity {
  layerId: "flights";
  icao24: string;
  callsign: string;
  originCountry: string;
  velocity: number;
  heading: number;
  verticalRate: number;
  onGround: boolean;
  squawk: string | null;
}

export interface MilitaryFlightEntity extends Omit<FlightEntity, "layerId"> {
  layerId: "military";
  operator: string;
  aircraftType: string;
  classification: "fighter" | "bomber" | "tanker" | "transport" | "recon" | "awacs" | "patrol" | "special" | "vip" | "helicopter" | "uav" | "unknown";
}

export interface VesselEntity extends BaseEntity {
  layerId: "maritime";
  mmsi: string;
  vesselType: "cargo" | "tanker" | "military" | "passenger" | "fishing" | "special" | "unknown";
  speed: number;
  heading: number;
  destination: string | null;
  flag: string | null;
}

export interface SeismicEntity extends BaseEntity {
  layerId: "seismic";
  magnitude: number;
  depth: number;
  place: string;
  eventType: "earthquake" | "volcano" | "tsunami";
}

export interface ConflictEntity extends BaseEntity {
  layerId: "conflicts";
  eventType: "battle" | "explosion" | "riot" | "protest" | "strategic" | "violence";
  fatalities: number;
  source: string;
  threatLevel: ThreatLevel;
}

export type TrackedEntity =
  | SatelliteEntity
  | FlightEntity
  | MilitaryFlightEntity
  | VesselEntity
  | SeismicEntity
  | ConflictEntity;
