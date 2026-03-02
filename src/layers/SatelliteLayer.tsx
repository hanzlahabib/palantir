import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import * as satellite from "satellite.js";
import { fetchTLEs, classifyOrbit, getOrbitColor } from "@/services/satelliteService";
import { useLayerStore } from "@/stores/layerStore";
import { useEntityStore } from "@/stores/entityStore";
import { useCameraStore } from "@/stores/cameraStore";
import type { SatelliteEntity } from "@/types/entities";

interface SatelliteLayerProps {
    viewer: Cesium.Viewer | null;
}

interface SatData {
    name: string;
    line1: string;
    line2: string;
    noradId: number;
    satrec: satellite.SatRec;
}

export default function SatelliteLayer({ viewer }: SatelliteLayerProps) {
    const enabled = useLayerStore((s) => s.getLayer("satellites")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const updateLastFetch = useLayerStore((s) => s.updateLastFetch);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
    const selectEntity = useEntityStore((s) => s.selectEntity);
    const detectionDensity = useCameraStore((s) => s.detectionDensity);
    const pointCollectionRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
    const labelCollectionRef = useRef<Cesium.LabelCollection | null>(null);
    const satDataRef = useRef<SatData[]>([]);
    const animFrameRef = useRef<number>(0);

    const propagateAll = useCallback(() => {
        if (!viewer || !pointCollectionRef.current) return;
        const points = pointCollectionRef.current;
        const labels = labelCollectionRef.current;
        const now = new Date();
        const gmst = satellite.gstime(now);

        for (let i = 0; i < satDataRef.current.length; i++) {
            const sat = satDataRef.current[i];
            try {
                const posVel = satellite.propagate(sat.satrec, now);
                if (!posVel.position || typeof posVel.position === "boolean") continue;

                const geo = satellite.eciToGeodetic(posVel.position as satellite.EciVec3<number>, gmst);
                const lon = satellite.degreesLong(geo.longitude);
                const lat = satellite.degreesLat(geo.latitude);
                const alt = geo.height * 1000; // km -> meters

                const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
                if (i < points.length) {
                    points.get(i).position = cartesian;
                    points.get(i).show = true;
                }

                if (labels && detectionDensity === "dense" && i < labels.length) {
                    labels.get(i).position = cartesian;
                    labels.get(i).show = true;
                }
            } catch {
                if (i < points.length) points.get(i).show = false;
                if (labels && i < labels.length) labels.get(i).show = false;
            }
        }

        animFrameRef.current = requestAnimationFrame(propagateAll);
    }, [viewer, detectionDensity]);

    useEffect(() => {
        if (!viewer || !enabled) {
            // Cleanup
            if (pointCollectionRef.current) {
                viewer?.scene.primitives.remove(pointCollectionRef.current);
                pointCollectionRef.current = null;
            }
            if (labelCollectionRef.current) {
                viewer?.scene.primitives.remove(labelCollectionRef.current);
                labelCollectionRef.current = null;
            }
            cancelAnimationFrame(animFrameRef.current);
            return;
        }

        let cancelled = false;

        async function loadSatellites() {
            setLayerLoading("satellites", true);

            try {
                const tles = await fetchTLEs("active");
                if (cancelled) return;

                satDataRef.current = tles.map((t) => ({
                    ...t,
                    satrec: satellite.twoline2satrec(t.line1, t.line2),
                }));

                // Create point collection
                const points = new Cesium.PointPrimitiveCollection();
                const labels = new Cesium.LabelCollection();

                for (const sat of satDataRef.current) {
                    // Get initial position for orbit classification
                    const now = new Date();
                    const posVel = satellite.propagate(sat.satrec, now);
                    let altKm = 400;
                    if (posVel.position && typeof posVel.position !== "boolean") {
                        const gmst = satellite.gstime(now);
                        const geo = satellite.eciToGeodetic(posVel.position as satellite.EciVec3<number>, gmst);
                        altKm = geo.height;
                    }

                    const orbit = classifyOrbit(altKm);
                    const color = Cesium.Color.fromCssColorString(getOrbitColor(orbit));

                    points.add({
                        position: Cesium.Cartesian3.ZERO,
                        pixelSize: 3,
                        color,
                        show: false,
                        id: `sat-${sat.noradId}`,
                    });

                    labels.add({
                        position: Cesium.Cartesian3.ZERO,
                        text: sat.name.length > 12 ? sat.name.substring(0, 12) : sat.name,
                        font: "10px JetBrains Mono",
                        fillColor: color,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        pixelOffset: new Cesium.Cartesian2(8, 0),
                        show: false,
                        scale: 0.8,
                    });
                }

                if (cancelled) return;

                viewer!.scene.primitives.add(points);
                viewer!.scene.primitives.add(labels);
                pointCollectionRef.current = points;
                labelCollectionRef.current = labels;

                updateEntityCount("satellites", satDataRef.current.length);
                updateLastFetch("satellites");

                // Start propagation loop
                propagateAll();
            } catch (err) {
                console.error("[SatelliteLayer] Load failed:", err);
            } finally {
                setLayerLoading("satellites", false);
            }
        }

        loadSatellites();

        // Click handler
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const picked = viewer.scene.pick(click.position);
            if (picked?.id?.startsWith?.("sat-")) {
                const noradId = parseInt(picked.id.replace("sat-", ""), 10);
                const sat = satDataRef.current.find((s) => s.noradId === noradId);
                if (sat) {
                    const now = new Date();
                    const posVel = satellite.propagate(sat.satrec, now);
                    if (posVel.position && typeof posVel.position !== "boolean") {
                        const gmst = satellite.gstime(now);
                        const geo = satellite.eciToGeodetic(posVel.position as satellite.EciVec3<number>, gmst);
                        const entity: SatelliteEntity = {
                            id: `sat-${sat.noradId}`,
                            layerId: "satellites",
                            name: sat.name,
                            lat: satellite.degreesLat(geo.latitude),
                            lon: satellite.degreesLong(geo.longitude),
                            alt: geo.height * 1000,
                            timestamp: Date.now(),
                            noradId: sat.noradId,
                            orbitType: classifyOrbit(geo.height),
                            category: "active",
                            tle1: sat.line1,
                            tle2: sat.line2,
                        };
                        selectEntity(entity);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        return () => {
            cancelled = true;
            cancelAnimationFrame(animFrameRef.current);
            handler.destroy();
            if (pointCollectionRef.current) {
                viewer.scene.primitives.remove(pointCollectionRef.current);
                pointCollectionRef.current = null;
            }
            if (labelCollectionRef.current) {
                viewer.scene.primitives.remove(labelCollectionRef.current);
                labelCollectionRef.current = null;
            }
        };
    }, [viewer, enabled, propagateAll, updateEntityCount, updateLastFetch, setLayerLoading, selectEntity]);

    return null;
}
