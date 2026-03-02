import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { fetchGdeltGeo, classifyThreat, getThreatColor } from "@/services/gdeltService";
import { useLayerStore } from "@/stores/layerStore";
import { useAlertStore } from "@/stores/alertStore";
import { UPDATE_INTERVALS } from "@/config/constants";

interface IntelLayerProps {
    viewer: Cesium.Viewer | null;
}

export default function IntelLayer({ viewer }: IntelLayerProps) {
    const enabled = useLayerStore((s) => s.getLayer("news")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const updateLastFetch = useLayerStore((s) => s.updateLastFetch);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
    const addAlert = useAlertStore((s) => s.addAlert);
    const dsRef = useRef<Cesium.CustomDataSource | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const update = useCallback(async () => {
        if (!viewer || !dsRef.current) return;
        try {
            const events = await fetchGdeltGeo("conflict OR military OR terrorism");
            const ds = dsRef.current;
            ds.entities.removeAll();

            for (const evt of events) {
                if (!evt.lat || !evt.lon) continue;
                const threat = classifyThreat(evt.name);
                const color = Cesium.Color.fromCssColorString(getThreatColor(threat));
                const size = Math.max(6, Math.min(20, evt.count * 2));

                ds.entities.add({
                    id: `intel-${evt.lat.toFixed(2)}-${evt.lon.toFixed(2)}`,
                    position: Cesium.Cartesian3.fromDegrees(evt.lon, evt.lat),
                    point: {
                        pixelSize: size,
                        color: color.withAlpha(0.7),
                        outlineColor: color,
                        outlineWidth: 1,
                    },
                    label: evt.count >= 3 ? {
                        text: evt.name.length > 20 ? evt.name.substring(0, 20) + "…" : evt.name,
                        font: "10px JetBrains Mono",
                        fillColor: color,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        pixelOffset: new Cesium.Cartesian2(size / 2 + 4, 0),
                        scale: 0.7,
                    } : undefined,
                });

                // Generate alerts for critical/high events
                if (threat === "critical" || threat === "high") {
                    addAlert({
                        id: `intel-alert-${Date.now()}-${evt.lat}`,
                        timestamp: Date.now(),
                        level: threat,
                        title: evt.name,
                        description: `${evt.count} source${evt.count > 1 ? "s" : ""} reporting`,
                        source: "news",
                        lat: evt.lat,
                        lon: evt.lon,
                    });
                }
            }

            updateEntityCount("news", events.length);
            updateLastFetch("news");
        } catch (err) {
            console.error("[IntelLayer] Update failed:", err);
        }
    }, [viewer, updateEntityCount, updateLastFetch, addAlert]);

    useEffect(() => {
        if (!viewer || !enabled) {
            if (dsRef.current) { viewer?.dataSources.remove(dsRef.current); dsRef.current = null; }
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        setLayerLoading("news", true);
        const ds = new Cesium.CustomDataSource("intel");
        viewer.dataSources.add(ds);
        dsRef.current = ds;

        update().finally(() => setLayerLoading("news", false));
        intervalRef.current = setInterval(update, UPDATE_INTERVALS.gdelt);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (dsRef.current) { viewer.dataSources.remove(dsRef.current); dsRef.current = null; }
        };
    }, [viewer, enabled, update, setLayerLoading]);

    return null;
}
