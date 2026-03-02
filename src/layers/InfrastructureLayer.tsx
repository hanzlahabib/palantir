import { useEffect, useRef } from "react";
import * as Cesium from "cesium";
import { useLayerStore } from "@/stores/layerStore";

interface InfrastructureLayerProps {
    viewer: Cesium.Viewer | null;
}

interface InfraAsset {
    name: string;
    lat: number;
    lon: number;
    type: "military" | "nuclear" | "datacenter" | "port";
    subtype?: string;
    status?: string;
}

// Curated static data — representative sample
const INFRASTRUCTURE: InfraAsset[] = [
    // Major US Military Bases
    { name: "Pentagon", lat: 38.8719, lon: -77.0563, type: "military", subtype: "HQ" },
    { name: "Fort Liberty", lat: 35.139, lon: -79.006, type: "military", subtype: "Army" },
    { name: "Camp Pendleton", lat: 33.231, lon: -117.379, type: "military", subtype: "Marines" },
    { name: "Norfolk Naval Base", lat: 36.946, lon: -76.302, type: "military", subtype: "Navy" },
    { name: "Ramstein AB", lat: 49.437, lon: 7.602, type: "military", subtype: "USAF" },
    { name: "Yokosuka Naval Base", lat: 35.298, lon: 139.654, type: "military", subtype: "Navy" },
    { name: "Diego Garcia", lat: -7.316, lon: 72.411, type: "military", subtype: "Joint" },
    { name: "Al Udeid AB", lat: 25.117, lon: 51.315, type: "military", subtype: "USAF" },
    { name: "Incirlik AB", lat: 37.002, lon: 35.426, type: "military", subtype: "USAF" },
    { name: "Guantanamo Bay", lat: 19.906, lon: -75.097, type: "military", subtype: "Navy" },
    { name: "Thule AB", lat: 76.531, lon: -68.703, type: "military", subtype: "Space Force" },

    // Nuclear Facilities
    { name: "Dimona (Israel)", lat: 31.003, lon: 35.144, type: "nuclear", status: "operational" },
    { name: "Bushehr (Iran)", lat: 28.833, lon: 50.884, type: "nuclear", status: "operational" },
    { name: "Yongbyon (DPRK)", lat: 39.797, lon: 125.754, type: "nuclear", status: "operational" },
    { name: "Sellafield (UK)", lat: 54.411, lon: -3.498, type: "nuclear", status: "decommissioning" },
    { name: "Zaporizhzhia (Ukraine)", lat: 47.508, lon: 34.596, type: "nuclear", status: "occupied" },
    { name: "Chernobyl (Ukraine)", lat: 51.389, lon: 30.098, type: "nuclear", status: "exclusion zone" },
    { name: "Fukushima Daiichi", lat: 37.421, lon: 141.033, type: "nuclear", status: "decommissioning" },
    { name: "La Hague (France)", lat: 49.679, lon: -1.876, type: "nuclear", status: "operational" },

    // Major Ports/Chokepoints
    { name: "Strait of Hormuz", lat: 26.564, lon: 56.255, type: "port", subtype: "chokepoint" },
    { name: "Strait of Malacca", lat: 2.5, lon: 101.5, type: "port", subtype: "chokepoint" },
    { name: "Suez Canal Entry", lat: 29.95, lon: 32.567, type: "port", subtype: "canal" },
    { name: "Panama Canal", lat: 9.08, lon: -79.68, type: "port", subtype: "canal" },
    { name: "Bab el-Mandeb", lat: 12.583, lon: 43.333, type: "port", subtype: "chokepoint" },
];

const TYPE_COLORS: Record<string, string> = {
    military: "#4488ff",
    nuclear: "#ff8800",
    datacenter: "#00ffff",
    port: "#44ff88",
};

const TYPE_ICONS: Record<string, string> = {
    military: "🛡",
    nuclear: "☢",
    datacenter: "🖥",
    port: "⚓",
};

export default function InfrastructureLayer({ viewer }: InfrastructureLayerProps) {
    const enabled = useLayerStore((s) => s.getLayer("infrastructure")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
    const dsRef = useRef<Cesium.CustomDataSource | null>(null);

    useEffect(() => {
        if (!viewer || !enabled) {
            if (dsRef.current) { viewer?.dataSources.remove(dsRef.current); dsRef.current = null; }
            return;
        }

        setLayerLoading("infrastructure", true);
        const ds = new Cesium.CustomDataSource("infrastructure");

        for (const asset of INFRASTRUCTURE) {
            const color = Cesium.Color.fromCssColorString(TYPE_COLORS[asset.type] || "#ffffff");

            ds.entities.add({
                id: `infra-${asset.name}`,
                position: Cesium.Cartesian3.fromDegrees(asset.lon, asset.lat),
                point: {
                    pixelSize: 6,
                    color: color.withAlpha(0.8),
                    outlineColor: color,
                    outlineWidth: 1,
                    scaleByDistance: new Cesium.NearFarScalar(10000, 1.5, 5000000, 0.5),
                },
                label: {
                    text: `${TYPE_ICONS[asset.type] || "◉"} ${asset.name}`,
                    font: "10px JetBrains Mono",
                    fillColor: color,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    pixelOffset: new Cesium.Cartesian2(10, 0),
                    scaleByDistance: new Cesium.NearFarScalar(10000, 1.0, 2000000, 0.0),
                    scale: 0.7,
                },
            });
        }

        viewer.dataSources.add(ds);
        dsRef.current = ds;
        updateEntityCount("infrastructure", INFRASTRUCTURE.length);
        setLayerLoading("infrastructure", false);

        return () => {
            if (dsRef.current) { viewer.dataSources.remove(dsRef.current); dsRef.current = null; }
        };
    }, [viewer, enabled, updateEntityCount, setLayerLoading]);

    return null;
}
