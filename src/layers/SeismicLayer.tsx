import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { fetchEarthquakes, getMagnitudeSize, getDepthColor, fetchFires, fetchNaturalEvents, getNaturalEventColor } from "@/services/earthquakeService";
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
    const waveDataSourceRef = useRef<Cesium.CustomDataSource | null>(null);
    const firePointsRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
    const eonetDsRef = useRef<Cesium.CustomDataSource | null>(null);
    const waveAnimRef = useRef<number>(0);
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

                // Seismic wave animation for recent quakes (< 1 hour)
                if (isRecent && eq.magnitude >= 3) {
                    const waveDist = eq.magnitude * 50000; // meters based on magnitude
                    const waveDs = waveDataSourceRef.current;
                    if (waveDs) {
                        waveDs.entities.add({
                            id: `wave-${eq.id}`,
                            position: Cesium.Cartesian3.fromDegrees(eq.lon, eq.lat),
                            ellipse: {
                                semiMajorAxis: waveDist,
                                semiMinorAxis: waveDist,
                                material: new Cesium.ColorMaterialProperty(color.withAlpha(0.15)),
                                outline: true,
                                outlineColor: new Cesium.ConstantProperty(color.withAlpha(0.6)),
                                outlineWidth: new Cesium.ConstantProperty(1),
                                height: 0,
                            },
                        });
                        // Second ring — smaller
                        waveDs.entities.add({
                            id: `wave2-${eq.id}`,
                            position: Cesium.Cartesian3.fromDegrees(eq.lon, eq.lat),
                            ellipse: {
                                semiMajorAxis: waveDist * 0.5,
                                semiMinorAxis: waveDist * 0.5,
                                material: new Cesium.ColorMaterialProperty(color.withAlpha(0.25)),
                                outline: true,
                                outlineColor: new Cesium.ConstantProperty(color.withAlpha(0.8)),
                                outlineWidth: new Cesium.ConstantProperty(1),
                                height: 0,
                            },
                        });
                    }
                }

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

            // Also fetch EONET natural events
            if (eonetDsRef.current) {
                try {
                    const events = await fetchNaturalEvents();
                    const eoDs = eonetDsRef.current;
                    eoDs.entities.removeAll();
                    for (const evt of events) {
                        const color = Cesium.Color.fromCssColorString(getNaturalEventColor(evt.category));
                        eoDs.entities.add({
                            id: `eonet-${evt.id}`,
                            position: Cesium.Cartesian3.fromDegrees(evt.lon, evt.lat),
                            point: { pixelSize: 10, color: color.withAlpha(0.9), outlineColor: color, outlineWidth: 2 },
                            label: {
                                text: `${evt.category.slice(0, 8)}`,
                                font: "9px JetBrains Mono",
                                fillColor: color,
                                outlineColor: Cesium.Color.BLACK,
                                outlineWidth: 2,
                                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                                pixelOffset: new Cesium.Cartesian2(10, 0),
                                scale: 0.7,
                            },
                        });
                    }
                } catch (err) {
                    console.error("[SeismicLayer] EONET update failed:", err);
                }
            }
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
            if (eqDataSourceRef.current) { viewer?.dataSources.remove(eqDataSourceRef.current); eqDataSourceRef.current = null; }
            if (eonetDsRef.current) { viewer?.dataSources.remove(eonetDsRef.current); eonetDsRef.current = null; }
            if (eqIntervalRef.current) clearInterval(eqIntervalRef.current);
            return;
        }

        setLayerLoading("seismic", true);
        const ds = new Cesium.CustomDataSource("earthquakes");
        const waveDs = new Cesium.CustomDataSource("seismic-waves");
        const eonetDs = new Cesium.CustomDataSource("natural-events");
        viewer.dataSources.add(ds);
        viewer.dataSources.add(waveDs);
        viewer.dataSources.add(eonetDs);
        eqDataSourceRef.current = ds;
        waveDataSourceRef.current = waveDs;
        eonetDsRef.current = eonetDs;

        // Animate wave rings — pulse alpha over time
        let wavePhase = 0;
        const animateWaves = () => {
            wavePhase += 0.02;
            for (let i = 0; i < waveDs.entities.values.length; i++) {
                const ent = waveDs.entities.values[i];
                if (ent?.ellipse?.material instanceof Cesium.ColorMaterialProperty) {
                    const base = ent.id?.startsWith("wave2-") ? 0.5 : 1.0;
                    const pulseAlpha = 0.1 + Math.abs(Math.sin(wavePhase + i * 0.3)) * 0.2 * base;
                    const baseColor = Cesium.Color.fromCssColorString("#ff6600");
                    ent.ellipse.material = new Cesium.ColorMaterialProperty(baseColor.withAlpha(pulseAlpha));
                }
            }
            waveAnimRef.current = requestAnimationFrame(animateWaves);
        };
        waveAnimRef.current = requestAnimationFrame(animateWaves);

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
            cancelAnimationFrame(waveAnimRef.current);
            handler.destroy();
            if (eqDataSourceRef.current) {
                viewer.dataSources.remove(eqDataSourceRef.current);
                eqDataSourceRef.current = null;
            }
            if (waveDataSourceRef.current) {
                viewer.dataSources.remove(waveDataSourceRef.current);
                waveDataSourceRef.current = null;
            }
            if (eonetDsRef.current) {
                viewer.dataSources.remove(eonetDsRef.current);
                eonetDsRef.current = null;
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
