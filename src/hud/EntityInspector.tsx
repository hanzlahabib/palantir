import { useEntityStore } from "@/stores/entityStore";
import type { TrackedEntity } from "@/types/entities";

export default function EntityInspector() {
    const selectedEntity = useEntityStore((s) => s.selectedEntity);
    const selectEntity = useEntityStore((s) => s.selectEntity);

    if (!selectedEntity) return null;

    return (
        <div className="fixed top-8 right-0 z-40 w-64 bg-bg-panel/90 backdrop-blur-sm border-l border-border-dim h-[calc(100vh-60px)] flex flex-col font-mono">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border-dim">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-accent-cyan">
                        {getEntityIcon(selectedEntity)}
                    </span>
                    <span className="text-xs text-text-primary font-bold truncate">
                        {selectedEntity.name}
                    </span>
                </div>
                <button
                    onClick={() => selectEntity(null)}
                    className="text-text-dim hover:text-alert-red text-xs cursor-pointer"
                >
                    ✕
                </button>
            </div>

            {/* Entity type badge */}
            <div className="px-3 py-1 border-b border-border-dim">
                <span className="text-[9px] px-1.5 py-0.5 bg-accent-green/10 text-accent-green border border-accent-green/30 uppercase tracking-wider">
                    {selectedEntity.layerId}
                </span>
            </div>

            {/* Properties */}
            <div className="flex-1 overflow-y-auto p-2">
                {getEntityProperties(selectedEntity).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-border-dim/50">
                        <span className="text-[10px] text-text-dim uppercase">{key}</span>
                        <span className="text-[10px] text-text-primary text-right max-w-[140px] truncate">
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="px-3 py-2 border-t border-border-dim flex gap-2">
                <button className="flex-1 text-[10px] py-1 border border-accent-green/30 text-accent-green hover:bg-accent-green/10 cursor-pointer">
                    TRACK
                </button>
                <button className="flex-1 text-[10px] py-1 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 cursor-pointer">
                    FLY TO
                </button>
            </div>
        </div>
    );
}

function getEntityIcon(entity: TrackedEntity): string {
    const icons: Record<string, string> = {
        satellites: "🛰",
        flights: "✈",
        military: "⚔",
        maritime: "🚢",
        seismic: "🌍",
        conflicts: "⚠",
    };
    return icons[entity.layerId] || "◉";
}

function getEntityProperties(entity: TrackedEntity): [string, string][] {
    const base: [string, string][] = [
        ["Latitude", entity.lat.toFixed(4)],
        ["Longitude", entity.lon.toFixed(4)],
    ];
    if (entity.alt) base.push(["Altitude", `${(entity.alt / 1000).toFixed(1)} km`]);

    switch (entity.layerId) {
        case "satellites":
            return [
                ...base,
                ["NORAD ID", String(entity.noradId)],
                ["Orbit", entity.orbitType],
                ["Category", entity.category],
                ...(entity.velocity ? [["Velocity", `${entity.velocity.toFixed(2)} km/s`] as [string, string]] : []),
                ...(entity.period ? [["Period", `${entity.period.toFixed(0)} min`] as [string, string]] : []),
            ];
        case "flights":
            return [
                ...base,
                ["Callsign", entity.callsign || "—"],
                ["ICAO24", entity.icao24],
                ["Origin", entity.originCountry],
                ["Speed", `${entity.velocity.toFixed(0)} m/s`],
                ["Heading", `${entity.heading.toFixed(0)}°`],
                ["V/R", `${entity.verticalRate.toFixed(1)} m/s`],
                ["Squawk", entity.squawk || "—"],
                ["On Ground", entity.onGround ? "YES" : "NO"],
            ];
        case "military":
            return [
                ...base,
                ["Callsign", entity.callsign || "—"],
                ["Operator", entity.operator],
                ["Type", entity.aircraftType],
                ["Class", entity.classification.toUpperCase()],
                ["Speed", `${entity.velocity.toFixed(0)} m/s`],
                ["Heading", `${entity.heading.toFixed(0)}°`],
            ];
        case "maritime":
            return [
                ...base,
                ["MMSI", entity.mmsi],
                ["Type", entity.vesselType],
                ["Speed", `${entity.speed.toFixed(1)} kts`],
                ["Heading", `${entity.heading.toFixed(0)}°`],
                ["Destination", entity.destination || "—"],
                ["Flag", entity.flag || "—"],
            ];
        case "seismic":
            return [
                ...base,
                ["Magnitude", `M${entity.magnitude.toFixed(1)}`],
                ["Depth", `${entity.depth.toFixed(1)} km`],
                ["Place", entity.place],
                ["Type", entity.eventType],
            ];
        case "conflicts":
            return [
                ...base,
                ["Event", entity.eventType],
                ["Fatalities", String(entity.fatalities)],
                ["Source", entity.source],
                ["Threat", entity.threatLevel.toUpperCase()],
            ];
        default:
            return base;
    }
}
