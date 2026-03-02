import { identifyCallsign, getNationColor, getClassificationColor } from "@/config/militaryCallsigns";

export interface MilitaryIdentification {
  callsign: string;
  operator: string;
  aircraftType: string;
  classification: string;
  nation: string;
  nationColor: string;
  classificationColor: string;
  isMilitary: boolean;
}

export function identifyMilitaryAircraft(
  callsign: string,
  icaoHex?: string
): MilitaryIdentification {
  const match = identifyCallsign(callsign);

  if (match) {
    return {
      callsign,
      operator: match.operator,
      aircraftType: match.type,
      classification: match.classification,
      nation: match.nation,
      nationColor: getNationColor(match.nation),
      classificationColor: getClassificationColor(match.classification),
      isMilitary: true,
    };
  }

  // Check ICAO hex range for military registrations
  if (icaoHex) {
    const hex = parseInt(icaoHex, 16);
    // US military: AE0000-AE7FFF
    if (hex >= 0xAE0000 && hex <= 0xAE7FFF) {
      return {
        callsign,
        operator: "US Military",
        aircraftType: "Unknown",
        classification: "unknown",
        nation: "US",
        nationColor: getNationColor("US"),
        classificationColor: "#888888",
        isMilitary: true,
      };
    }
    // UK military: 43C000-43CFFF
    if (hex >= 0x43C000 && hex <= 0x43CFFF) {
      return {
        callsign,
        operator: "UK Military",
        aircraftType: "Unknown",
        classification: "unknown",
        nation: "UK",
        nationColor: getNationColor("UK"),
        classificationColor: "#888888",
        isMilitary: true,
      };
    }
  }

  return {
    callsign,
    operator: "Unknown",
    aircraftType: "Unknown",
    classification: "unknown",
    nation: "Unknown",
    nationColor: "#888888",
    classificationColor: "#888888",
    isMilitary: false,
  };
}

export function isOrbitPattern(
  positions: { lat: number; lon: number; timestamp: number }[]
): boolean {
  if (positions.length < 10) return false;
  const headings: number[] = [];
  for (let i = 1; i < positions.length; i++) {
    const dlat = positions[i]!.lat - positions[i - 1]!.lat;
    const dlon = positions[i]!.lon - positions[i - 1]!.lon;
    headings.push(Math.atan2(dlon, dlat));
  }
  let totalTurn = 0;
  for (let i = 1; i < headings.length; i++) {
    let diff = headings[i]! - headings[i - 1]!;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    totalTurn += diff;
  }
  return Math.abs(totalTurn) > Math.PI * 1.5;
}
