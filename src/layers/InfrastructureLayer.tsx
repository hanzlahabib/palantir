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

// Major submarine cable routes (simplified waypoints)
const SUBMARINE_CABLES: { name: string; color: string; coords: [number, number][] }[] = [
    {
        name: "Transatlantic (TAT-14)",
        color: "#00aaff",
        coords: [[-5.5, 50.0], [-20, 48], [-40, 44], [-55, 42], [-70, 40.7]],
    },
    {
        name: "SEA-ME-WE 3",
        color: "#ff8800",
        coords: [[103.8, 1.3], [95, 5], [76, 10], [56, 25], [43, 12.5], [32.5, 30], [29, 41], [12, 37], [-5, 36]],
    },
    {
        name: "Pacific Crossing (PC-1)",
        color: "#44ff44",
        coords: [[139.7, 35.7], [160, 40], [180, 42], [-160, 45], [-140, 42], [-124, 37.8]],
    },
    {
        name: "Africa Coast to Europe (ACE)",
        color: "#ff44ff",
        coords: [[-5, 36], [-10, 28], [-16, 18], [-17, 14.7], [-13.5, 9.5], [-4, 5.3], [3.4, 6.4]],
    },
    {
        name: "Asia-America Gateway (AAG)",
        color: "#ffff00",
        coords: [[106.7, 10.8], [109, 8], [115, 3], [120, -5], [140, -10], [170, -5], [-170, 10], [-155, 20], [-120, 33]],
    },
    {
        name: "FALCON",
        color: "#00ffff",
        coords: [[56, 25], [54, 24], [51, 25], [48, 29], [46, 28], [43.5, 13.5], [45, 12.1]],
    },
    {
        name: "EIG (Europe India Gateway)",
        color: "#aa88ff",
        coords: [[-1, 51.5], [-5, 36], [10, 36], [30, 31], [33, 30], [43, 12], [56, 25], [65, 23], [73, 19]],
    },
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

        // Render infrastructure points
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

        // Render submarine cable polylines
        for (const cable of SUBMARINE_CABLES) {
            const positions = cable.coords.map(([lon, lat]) =>
                Cesium.Cartesian3.fromDegrees(lon, lat, -100) // slightly below surface
            );
            const cableColor = Cesium.Color.fromCssColorString(cable.color);

            ds.entities.add({
                id: `cable-${cable.name}`,
                polyline: {
                    positions,
                    width: 1.5,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.3,
                        color: cableColor.withAlpha(0.6),
                    }),
                    clampToGround: true,
                },
            });

            // Label at midpoint
            const mid = cable.coords[Math.floor(cable.coords.length / 2)];
            if (mid) {
                ds.entities.add({
                    id: `cable-label-${cable.name}`,
                    position: Cesium.Cartesian3.fromDegrees(mid[0], mid[1]),
                    label: {
                        text: `🔌 ${cable.name}`,
                        font: "9px JetBrains Mono",
                        fillColor: cableColor,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        scaleByDistance: new Cesium.NearFarScalar(100000, 0.8, 5000000, 0.0),
                        scale: 0.6,
                    },
                });
            }
        }

        viewer.dataSources.add(ds);
        dsRef.current = ds;
        updateEntityCount("infrastructure", INFRASTRUCTURE.length + SUBMARINE_CABLES.length);
        setLayerLoading("infrastructure", false);

        return () => {
            if (dsRef.current) { viewer.dataSources.remove(dsRef.current); dsRef.current = null; }
        };
    }, [viewer, enabled, updateEntityCount, setLayerLoading]);

    return null;
}
