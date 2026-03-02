import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { fetchEarthquakes, getMagnitudeSize, getDepthColor, fetchFires } from "@/services/earthquakeService";
import { useLayerStore } from "@/stores/layerStore";
import { useEntityStore } from "@/stores/entityStore";
import { useAlertStore } from "@/stores/alertStore";
import { UPDATE_INTERVALS } from "@/config/constants";
import type { SeismicEntity } from "@/types/entities";

interface SeismicLayerProps {
    viewer: Cesium.Viewer | null;
}

export default function SeismicLayer({ viewer }: SeismicLayerProps) {
    const seismicEnabled = useLayerStore((s) => s.getLayer("seismic")?.enabled);
    const firesEnabled = useLayerStore((s) => s.getLayer("fires")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const updateLastFetch = useLayerStore((s) => s.updateLastFetch);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
    const selectEntity = useEntityStore((s) => s.selectEntity);
    const addAlert = useAlertStore((s) => s.addAlert);
    const eqDataSourceRef = useRef<Cesium.CustomDataSource | null>(null);
    const firePointsRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
    const eqIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const fireIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const seenEqRef = useRef<Set<string>>(new Set());

    const updateEarthquakes = useCallback(async () => {
        if (!viewer || !eqDataSourceRef.current) return;

        try {
            const quakes = await fetchEarthquakes("all_day");
            const ds = eqDataSourceRef.current;
            ds.entities.removeAll();

            for (const eq of quakes) {
                const size = getMagnitudeSize(eq.magnitude);
                const color = Cesium.Color.fromCssColorString(getDepthColor(eq.depth));
                const isRecent = Date.now() - eq.time < 3600_000; // last hour

                ds.entities.add({
                    id: `eq-${eq.id}`,
                    position: Cesium.Cartesian3.fromDegrees(eq.lon, eq.lat),
                    point: {
                        pixelSize: size,
                        color: color.withAlpha(0.8),
                        outlineColor: color,
                        outlineWidth: isRecent ? 2 : 1,
                    },
                    label: eq.magnitude >= 4 ? {
                        text: `M${eq.magnitude.toFixed(1)}`,
                        font: "10px JetBrains Mono",
                        fillColor: color,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        pixelOffset: new Cesium.Cartesian2(size / 2 + 4, 0),
                        scale: 0.8,
                    } : undefined,
                });

                // Alert for significant quakes
                if (eq.magnitude >= 5 && !seenEqRef.current.has(eq.id)) {
                    seenEqRef.current.add(eq.id);
                    addAlert({
                        id: `eq-alert-${eq.id}`,
                        timestamp: eq.time,
                        level: eq.magnitude >= 7 ? "critical" : eq.magnitude >= 6 ? "high" : "medium",
                        title: `M${eq.magnitude.toFixed(1)} Earthquake — ${eq.place}`,
                        description: `Depth: ${eq.depth.toFixed(1)}km${eq.tsunami ? " | TSUNAMI WARNING" : ""}`,
                        source: "seismic",
                        lat: eq.lat,
                        lon: eq.lon,
                    });
                }
            }

            updateEntityCount("seismic", quakes.length);
            updateLastFetch("seismic");
        } catch (err) {
            console.error("[SeismicLayer] Earthquake update failed:", err);
        }
    }, [viewer, updateEntityCount, updateLastFetch, addAlert]);

    const updateFires = useCallback(async () => {
        if (!viewer || !firePointsRef.current) return;

        try {
            const fires = await fetchFires();
            const points = firePointsRef.current;

            while (points.length < fires.length) {
                points.add({ position: Cesium.Cartesian3.ZERO, pixelSize: 3, show: false });
            }

            for (let i = 0; i < fires.length; i++) {
                const f = fires[i];
                const point = points.get(i);
                const intensity = Math.min(f.frp / 100, 1);
                point.position = Cesium.Cartesian3.fromDegrees(f.lon, f.lat);
                point.pixelSize = 3 + intensity * 5;
                point.color = Cesium.Color.fromCssColorString(`hsl(${20 - intensity * 20}, 100%, ${50 + intensity * 30}%)`);
                point.show = true;
            }

            for (let i = fires.length; i < points.length; i++) {
                points.get(i).show = false;
            }

            updateEntityCount("fires", fires.length);
            updateLastFetch("fires");
        } catch (err) {
            console.error("[SeismicLayer] Fire update failed:", err);
        }
    }, [viewer, updateEntityCount, updateLastFetch]);

    // Earthquakes lifecycle
    useEffect(() => {
        if (!viewer || !seismicEnabled) {
            if (eqDataSourceRef.current) {
                viewer?.dataSources.remove(eqDataSourceRef.current);
                eqDataSourceRef.current = null;
            }
            if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
            return;
        }

        setLayerLoading("seismic", true);
        const ds = new Cesium.CustomDataSource("earthquakes");
        viewer.dataSources.add(ds);
        eqDataSourceRef.current = ds;

        updateEarthquakes().finally(() => setLayerLoading("seismic", false));
        eqIntervalRef.current = setInterval(updateEarthquakes, UPDATE_INTERVALS.seismic);

        // Click handler
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const picked = viewer.scene.pick(click.position);
            if (picked?.id?.id?.startsWith?.("eq-")) {
                const entity = picked.id;
                const pos = entity.position?.getValue(Cesium.JulianDate.now());
                if (pos) {
                    const carto = Cesium.Cartographic.fromCartesian(pos);
                    selectEntity({
                        id: entity.id,
                        layerId: "seismic",
                        name: `Earthquake ${entity.id.replace("eq-", "")}`,
                        lat: Cesium.Math.toDegrees(carto.latitude),
                        lon: Cesium.Math.toDegrees(carto.longitude),
                        timestamp: Date.now(),
                        magnitude: 0,
                        depth: 0,
                        place: "",
                        eventType: "earthquake",
                    } satisfies SeismicEntity);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        return () => {
            if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
            handler.destroy();
            if (eqDataSourceRef.current) {
                viewer.dataSources.remove(eqDataSourceRef.current);
                eqDataSourceRef.current = null;
            }
        };
    }, [viewer, seismicEnabled, updateEarthquakes, setLayerLoading, selectEntity]);

    // Fires lifecycle
    useEffect(() => {
        if (!viewer || !firesEnabled) {
            if (firePointsRef.current) {
                viewer?.scene.primitives.remove(firePointsRef.current);
                firePointsRef.current = null;
            }
            if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
            return;
        }

        setLayerLoading("fires", true);
        const points = new Cesium.PointPrimitiveCollection();
        viewer.scene.primitives.add(points);
        firePointsRef.current = points;

        updateFires().finally(() => setLayerLoading("fires", false));
        fireIntervalRef.current = setInterval(updateFires, UPDATE_INTERVALS.fires);

        return () => {
            if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
            if (firePointsRef.current) {
                viewer.scene.primitives.remove(firePointsRef.current);
                firePointsRef.current = null;
            }
        };
    }, [viewer, firesEnabled, updateFires, setLayerLoading]);

    return null;
}
