import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { useLayerStore } from "@/stores/layerStore";
import { useAlertStore } from "@/stores/alertStore";
import { HOTSPOTS } from "@/config/hotspots";
import { UPDATE_INTERVALS } from "@/config/constants";

interface ConflictLayerProps {
    viewer: Cesium.Viewer | null;
}

const EVENT_COLORS: Record<string, string> = {
    battle: "#ff0000",
    explosion: "#ff6600",
    riot: "#ffaa00",
    protest: "#ffff00",
    strategic: "#4488ff",
    violence: "#ff4444",
};

const HOTSPOT_COLORS: Record<string, string> = {
    conflict: "#ff0000",
    nuclear: "#ff8800",
    maritime: "#4488ff",
    cyber: "#00ffff",
    political: "#ffaa00",
};

export default function ConflictLayer({ viewer }: ConflictLayerProps) {
    const enabled = useLayerStore((s) => s.getLayer("conflicts")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const updateLastFetch = useLayerStore((s) => s.updateLastFetch);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
    const addAlert = useAlertStore((s) => s.addAlert);
    const dsRef = useRef<Cesium.CustomDataSource | null>(null);
    const hotspotDsRef = useRef<Cesium.CustomDataSource | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pulseRef = useRef<number>(0);

    // Render pulsing hotspot zones
    const renderHotspots = useCallback(() => {
        if (!viewer || !hotspotDsRef.current) return;
        const ds = hotspotDsRef.current;
        ds.entities.removeAll();

        for (const hotspot of HOTSPOTS) {
            const color = Cesium.Color.fromCssColorString(HOTSPOT_COLORS[hotspot.category] || "#ff0000");
            const radiusMeters = hotspot.radius * 1000;

            // Outer ring — large semi-transparent zone
            ds.entities.add({
                id: `hotspot-zone-${hotspot.id}`,
                position: Cesium.Cartesian3.fromDegrees(hotspot.lon, hotspot.lat),
                ellipse: {
                    semiMajorAxis: radiusMeters,
                    semiMinorAxis: radiusMeters,
                    material: color.withAlpha(0.05),
                    outline: true,
                    outlineColor: color.withAlpha(0.3),
                    outlineWidth: 1,
                    height: 0,
                },
            });

            // Inner ring — denser core (40% of radius)
            ds.entities.add({
                id: `hotspot-core-${hotspot.id}`,
                position: Cesium.Cartesian3.fromDegrees(hotspot.lon, hotspot.lat),
                ellipse: {
                    semiMajorAxis: radiusMeters * 0.4,
                    semiMinorAxis: radiusMeters * 0.4,
                    material: color.withAlpha(0.1),
                    outline: true,
                    outlineColor: color.withAlpha(0.5),
                    outlineWidth: 1,
                    height: 0,
                },
            });

            // Center label
            ds.entities.add({
                id: `hotspot-label-${hotspot.id}`,
                position: Cesium.Cartesian3.fromDegrees(hotspot.lon, hotspot.lat),
                label: {
                    text: `⚠ ${hotspot.name}\nTHREAT: ${hotspot.baselineThreat}`,
                    font: "10px JetBrains Mono",
                    fillColor: color,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    scaleByDistance: new Cesium.NearFarScalar(100000, 1.0, 5000000, 0.0),
                    scale: 0.7,
                },
                point: {
                    pixelSize: 4,
                    color: color,
                    outlineColor: color.withAlpha(0.5),
                    outlineWidth: 3,
                },
            });
        }
    }, [viewer]);

    // Animate pulsing effect by modifying ellipse alpha
    const animatePulse = useCallback(() => {
        if (!hotspotDsRef.current) return;
        const time = Date.now() / 1000;
        const pulse = (Math.sin(time * 2) + 1) / 2; // 0..1 oscillation

        const ds = hotspotDsRef.current;
        for (let i = 0; i < ds.entities.values.length; i++) {
            const entity = ds.entities.values[i];
            if (entity.id && typeof entity.id === "string" && entity.id.startsWith("hotspot-zone-") && entity.ellipse) {
                const baseAlpha = 0.03 + pulse * 0.06;
                entity.ellipse.material = new Cesium.ColorMaterialProperty(
                    Cesium.Color.RED.withAlpha(baseAlpha)
                );
            }
        }

        pulseRef.current = requestAnimationFrame(animatePulse);
    }, []);

    const update = useCallback(async () => {
        if (!viewer || !dsRef.current) return;
        try {
            const resp = await fetch("/api/conflicts");
            if (!resp.ok) throw new Error(`Conflict fetch failed: ${resp.status}`);
            const data = await resp.json();
            const ds = dsRef.current;
            ds.entities.removeAll();

            const events = data.data || data.Result || [];
            let count = 0;

            for (const evt of events) {
                const lat = parseFloat(evt.latitude || evt.latitude_val || evt.gw_lat || 0);
                const lon = parseFloat(evt.longitude || evt.longitude_val || evt.gw_lon || 0);
                if (!lat || !lon) continue;

                const eventType = (evt.event_type || evt.type_of_violence_text || "violence").toLowerCase();
                const matchedType = Object.keys(EVENT_COLORS).find((t) => eventType.includes(t)) || "violence";
                const fatalities = parseInt(evt.fatalities || evt.deaths_a || 0, 10);
                const color = Cesium.Color.fromCssColorString(EVENT_COLORS[matchedType] || "#ff4444");

                ds.entities.add({
                    id: `conf-${count}`,
                    position: Cesium.Cartesian3.fromDegrees(lon, lat),
                    point: {
                        pixelSize: Math.max(6, Math.min(20, 6 + fatalities)),
                        color: color.withAlpha(0.7),
                        outlineColor: color,
                        outlineWidth: 1,
                    },
                    label: fatalities >= 10 ? {
                        text: `⚠ ${fatalities}`,
                        font: "10px JetBrains Mono",
                        fillColor: color,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        pixelOffset: new Cesium.Cartesian2(12, 0),
                        scale: 0.7,
                    } : undefined,
                });

                if (fatalities >= 20) {
                    addAlert({
                        id: `conf-alert-${count}`,
                        timestamp: Date.now(),
                        level: fatalities >= 50 ? "critical" : "high",
                        title: `${matchedType.toUpperCase()}: ${evt.location || evt.gw_location || "Unknown"} — ${fatalities} casualties`,
                        description: evt.notes || evt.source_article || "",
                        source: "conflicts",
                        lat, lon,
                    });
                }

                count++;
            }

            updateEntityCount("conflicts", count);
            updateLastFetch("conflicts");
        } catch (err) {
            console.error("[ConflictLayer] Update failed:", err);
        }
    }, [viewer, updateEntityCount, updateLastFetch, addAlert]);

    useEffect(() => {
        if (!viewer || !enabled) {
            cancelAnimationFrame(pulseRef.current);
            if (dsRef.current) { viewer?.dataSources.remove(dsRef.current); dsRef.current = null; }
            if (hotspotDsRef.current) { viewer?.dataSources.remove(hotspotDsRef.current); hotspotDsRef.current = null; }
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        setLayerLoading("conflicts", true);

        // Conflict events data source
        const ds = new Cesium.CustomDataSource("conflicts");
        viewer.dataSources.add(ds);
        dsRef.current = ds;

        // Hotspot zones data source
        const hotspotDs = new Cesium.CustomDataSource("hotspots");
        viewer.dataSources.add(hotspotDs);
        hotspotDsRef.current = hotspotDs;

        renderHotspots();
        animatePulse();
        update().finally(() => setLayerLoading("conflicts", false));
        intervalRef.current = setInterval(update, UPDATE_INTERVALS.conflicts);

        return () => {
            cancelAnimationFrame(pulseRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (dsRef.current) { viewer.dataSources.remove(dsRef.current); dsRef.current = null; }
            if (hotspotDsRef.current) { viewer.dataSources.remove(hotspotDsRef.current); hotspotDsRef.current = null; }
        };
    }, [viewer, enabled, update, renderHotspots, animatePulse, setLayerLoading]);

    return null;
}
