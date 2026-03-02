export interface CallsignPattern {
    pattern: string;
    operator: string;
    type: string;
    classification: string;
    nation: string;
}

export const MILITARY_CALLSIGNS: CallsignPattern[] = [
    // US Air Force — Transport
    { pattern: "RCH", operator: "USAF AMC", type: "C-17/C-5", classification: "transport", nation: "US" },
    { pattern: "REACH", operator: "USAF AMC", type: "C-17/C-5", classification: "transport", nation: "US" },
    { pattern: "MOOSE", operator: "USAF", type: "C-17", classification: "transport", nation: "US" },
    { pattern: "HERKY", operator: "USAF", type: "C-130", classification: "transport", nation: "US" },

    // US Air Force — Tankers
    { pattern: "KING", operator: "USAF", type: "KC-135", classification: "tanker", nation: "US" },
    { pattern: "SHELL", operator: "USAF", type: "KC-135", classification: "tanker", nation: "US" },
    { pattern: "TEAL", operator: "USAF", type: "KC-46", classification: "tanker", nation: "US" },

    // US Air Force — Recon/SIGINT
    { pattern: "COBRA", operator: "USAF", type: "RC-135V/W", classification: "recon", nation: "US" },
    { pattern: "RIVET", operator: "USAF", type: "RC-135", classification: "recon", nation: "US" },
    { pattern: "OLIVE", operator: "USAF", type: "RC-135S", classification: "recon", nation: "US" },
    { pattern: "DRAGN", operator: "USAF", type: "U-2", classification: "recon", nation: "US" },
    { pattern: "JAKE", operator: "USAF", type: "E-8 JSTARS", classification: "recon", nation: "US" },

    // US Air Force — AWACS
    { pattern: "SNTRY", operator: "USAF", type: "E-3 Sentry", classification: "awacs", nation: "US" },
    { pattern: "MOJO", operator: "USAF", type: "E-3 Sentry", classification: "awacs", nation: "US" },

    // US Air Force — Bombers
    { pattern: "BONE", operator: "USAF", type: "B-1B Lancer", classification: "bomber", nation: "US" },
    { pattern: "DEATH", operator: "USAF", type: "B-2 Spirit", classification: "bomber", nation: "US" },
    { pattern: "DOOM", operator: "USAF", type: "B-52", classification: "bomber", nation: "US" },

    // US Air Force — Fighters
    { pattern: "BOLT", operator: "USAF", type: "F-16", classification: "fighter", nation: "US" },
    { pattern: "VIPER", operator: "USAF", type: "F-16", classification: "fighter", nation: "US" },
    { pattern: "RAPTOR", operator: "USAF", type: "F-22", classification: "fighter", nation: "US" },

    // US Air Force — VIP
    { pattern: "SAM", operator: "USAF", type: "VIP Transport", classification: "vip", nation: "US" },
    { pattern: "AF1", operator: "USAF", type: "Air Force One", classification: "vip", nation: "US" },
    { pattern: "AF2", operator: "USAF", type: "Air Force Two", classification: "vip", nation: "US" },
    { pattern: "EXEC", operator: "USAF", type: "VIP Transport", classification: "vip", nation: "US" },

    // US Air Force — Special Ops
    { pattern: "SHADOW", operator: "USAF AFSOC", type: "MC-130/AC-130", classification: "special", nation: "US" },
    { pattern: "GOLD", operator: "USAF AFSOC", type: "Special Ops", classification: "special", nation: "US" },
    { pattern: "NCHO", operator: "USAF", type: "Spec Ops", classification: "special", nation: "US" },

    // US Air Force — UAV
    { pattern: "REAPER", operator: "USAF", type: "MQ-9 Reaper", classification: "uav", nation: "US" },

    // US Navy
    { pattern: "NAVY", operator: "USN", type: "Navy Aircraft", classification: "patrol", nation: "US" },
    { pattern: "TRIDENT", operator: "USN", type: "P-8 Poseidon", classification: "patrol", nation: "US" },

    // US Marines
    { pattern: "MARINE", operator: "USMC", type: "Marine Aircraft", classification: "transport", nation: "US" },
    { pattern: "HMX", operator: "USMC", type: "Marine One/VH-60", classification: "vip", nation: "US" },

    // US Army
    { pattern: "ARMY", operator: "US Army", type: "Army Aviation", classification: "helicopter", nation: "US" },
    { pattern: "PAT", operator: "US Army", type: "Priority Air Transport", classification: "vip", nation: "US" },

    // UK
    { pattern: "ASCOT", operator: "RAF", type: "Transport", classification: "transport", nation: "UK" },
    { pattern: "RAF", operator: "RAF", type: "Royal Air Force", classification: "fighter", nation: "UK" },
    { pattern: "TARTAN", operator: "RAF", type: "RC-135W", classification: "recon", nation: "UK" },
    { pattern: "NATO", operator: "NATO", type: "NATO AWACS", classification: "awacs", nation: "NATO" },

    // France
    { pattern: "FAF", operator: "French AF", type: "French Air Force", classification: "fighter", nation: "FR" },
    { pattern: "CTM", operator: "French AF", type: "Transport", classification: "transport", nation: "FR" },

    // Germany
    { pattern: "GAF", operator: "Luftwaffe", type: "German AF", classification: "fighter", nation: "DE" },
];

export const HOTSPOTS = [
    { name: "Pentagon", lat: 38.8719, lon: -77.0563, radiusKm: 100 },
    { name: "Black Sea", lat: 43.5, lon: 34.0, radiusKm: 500 },
    { name: "Taiwan Strait", lat: 24.5, lon: 119.5, radiusKm: 300 },
    { name: "Korean DMZ", lat: 38.0, lon: 127.0, radiusKm: 200 },
    { name: "Persian Gulf", lat: 26.5, lon: 52.0, radiusKm: 400 },
    { name: "South China Sea", lat: 15.0, lon: 115.0, radiusKm: 500 },
    { name: "Suez Canal", lat: 30.5, lon: 32.3, radiusKm: 100 },
    { name: "Bosphorus", lat: 41.1, lon: 29.0, radiusKm: 50 },
    { name: "Gibraltar", lat: 36.1, lon: -5.35, radiusKm: 50 },
    { name: "Arctic/Kola", lat: 68.0, lon: 33.0, radiusKm: 300 },
    { name: "Kaliningrad", lat: 54.7, lon: 20.5, radiusKm: 150 },
    { name: "Guam/Pacific", lat: 13.4, lon: 144.7, radiusKm: 200 },
];

export function identifyCallsign(callsign: string): CallsignPattern | null {
    const upper = callsign.toUpperCase().trim();
    for (const pattern of MILITARY_CALLSIGNS) {
        if (upper.startsWith(pattern.pattern)) return pattern;
    }
    return null;
}

export function getNationColor(nation: string): string {
    switch (nation) {
        case "US": return "#4488ff";
        case "UK": case "FR": case "DE": case "NATO": return "#44ff88";
        default: return "#ffffff";
    }
}

export function getClassificationColor(classification: string): string {
    switch (classification) {
        case "fighter": return "#ff4444";
        case "bomber": return "#ff0000";
        case "tanker": return "#ff8844";
        case "recon": return "#ff44ff";
        case "awacs": return "#ffff44";
        case "vip": return "#44ffff";
        case "special": return "#ff8800";
        default: return "#ff6600";
    }
}
