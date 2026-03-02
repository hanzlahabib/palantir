import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { useLayerStore } from "@/stores/layerStore";
import { useAlertStore } from "@/stores/alertStore";

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

export default function ConflictLayer({ viewer }: ConflictLayerProps) {
    const enabled = useLayerStore((s) => s.getLayer("conflicts")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const updateLastFetch = useLayerStore((s) => s.updateLastFetch);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);

    const addAlert = useAlertStore((s) => s.addAlert);
    const dsRef = useRef<Cesium.CustomDataSource | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const update = useCallback(async () => {
        if (!viewer || !dsRef.current) return;
        try {
            const resp = await fetch("/api/conflicts");
            if (!resp.ok) throw new Error(`Conflict fetch failed: ${resp.status}`);
            const data = await resp.json();
            const ds = dsRef.current;
            ds.entities.removeAll();

            // Try ACLED format first, then UCDP
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

                // Alert for high-fatality events
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
            if (dsRef.current) { viewer?.dataSources.remove(dsRef.current); dsRef.current = null; }
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        setLayerLoading("conflicts", true);
        const ds = new Cesium.CustomDataSource("conflicts");
        viewer.dataSources.add(ds);
        dsRef.current = ds;

        update().finally(() => setLayerLoading("conflicts", false));
        intervalRef.current = setInterval(update, UPDATE_INTERVALS.conflicts);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (dsRef.current) { viewer.dataSources.remove(dsRef.current); dsRef.current = null; }
        };
    }, [viewer, enabled, update, setLayerLoading]);

    return null;
}
