import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { fetchFlights, getAltitudeColor, getSquawkAlert, type FlightState } from "@/services/flightService";
import { useLayerStore } from "@/stores/layerStore";
import { useEntityStore } from "@/stores/entityStore";
import { useAlertStore } from "@/stores/alertStore";
import { useCameraStore } from "@/stores/cameraStore";
import type { FlightEntity } from "@/types/entities";
import { UPDATE_INTERVALS } from "@/config/constants";

function getHeadingArrow(heading: number): string {
    const dirs = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];
    const idx = Math.round(((heading % 360) + 360) % 360 / 45) % 8;
    return dirs[idx] || "↑";
}

interface FlightLayerProps {
    viewer: Cesium.Viewer | null;
}

export default function FlightLayer({ viewer }: FlightLayerProps) {
    const enabled = useLayerStore((s) => s.getLayer("flights")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const updateLastFetch = useLayerStore((s) => s.updateLastFetch);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
    const selectEntity = useEntityStore((s) => s.selectEntity);
    const addAlert = useAlertStore((s) => s.addAlert);
    const detectionDensity = useCameraStore((s) => s.detectionDensity);
    const pointCollectionRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
    const labelCollectionRef = useRef<Cesium.LabelCollection | null>(null);
    const trailDataSourceRef = useRef<Cesium.CustomDataSource | null>(null);
    const flightsRef = useRef<FlightState[]>([]);
    const positionHistoryRef = useRef<Map<string, { lat: number; lon: number; alt: number }[]>>(new Map());
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const seenEmergenciesRef = useRef<Set<string>>(new Set());

    const updateFlights = useCallback(async () => {
        if (!viewer || !pointCollectionRef.current) return;

        try {
            const flights = await fetchFlights();
            flightsRef.current = flights;

            const points = pointCollectionRef.current;
            const labels = labelCollectionRef.current;

            // Resize collections if needed
            while (points.length < flights.length) {
                points.add({ position: Cesium.Cartesian3.ZERO, pixelSize: 4, show: false });
            }
            if (labels) {
                while (labels.length < flights.length) {
                    labels.add({
                        position: Cesium.Cartesian3.ZERO,
                        text: "",
                        font: "10px JetBrains Mono",
                        fillColor: Cesium.Color.WHITE,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        pixelOffset: new Cesium.Cartesian2(8, 0),
                        show: false,
                        scale: 0.7,
                    });
                }
            }

            for (let i = 0; i < flights.length; i++) {
                const f = flights[i];
                const position = Cesium.Cartesian3.fromDegrees(f.lon, f.lat, f.altitude);
                const color = Cesium.Color.fromCssColorString(
                    f.isEmergency ? "#ff0000" : getAltitudeColor(f.altitude)
                );

                // Track position history for trails (keep last 20)
                const key = f.icao24;
                const history = positionHistoryRef.current.get(key) || [];
                history.push({ lat: f.lat, lon: f.lon, alt: f.altitude });
                if (history.length > 20) history.shift();
                positionHistoryRef.current.set(key, history);

                const point = points.get(i);
                point.position = position;
                point.pixelSize = f.isEmergency ? 8 : 4;
                point.color = color;
                point.show = true;
                (point as any).id = `flt-${f.icao24}`;

                // Heading arrow character + altitude label in dense mode
                if (labels && i < labels.length) {
                    const label = labels.get(i);
                    label.position = position;
                    const headingArrow = getHeadingArrow(f.heading);
                    label.text = detectionDensity === "dense"
                        ? `${headingArrow} ${f.callsign || f.icao24}`
                        : "";
                    label.fillColor = color;
                    label.show = detectionDensity === "dense";
                }

                // Emergency squawk alert
                if (f.isEmergency && !seenEmergenciesRef.current.has(f.icao24)) {
                    seenEmergenciesRef.current.add(f.icao24);
                    const alert = getSquawkAlert(f.squawk);
                    if (alert) {
                        addAlert({
                            id: `squawk-${f.icao24}-${Date.now()}`,
                            timestamp: Date.now(),
                            level: alert.level as any,
                            title: `${alert.message}: ${f.callsign || f.icao24}`,
                            description: `Squawk ${f.squawk} from ${f.originCountry}`,
                            source: "flights",
                            lat: f.lat,
                            lon: f.lon,
                        });
                    }
                }
            }

            // Hide excess points
            for (let i = flights.length; i < points.length; i++) {
                points.get(i).show = false;
            }
            if (labels) {
                for (let i = flights.length; i < labels.length; i++) {
                    labels.get(i).show = false;
                }
            }

            updateEntityCount("flights", flights.length);
            updateLastFetch("flights");
        } catch (err) {
            console.error("[FlightLayer] Update failed:", err);
        }
    }, [viewer, detectionDensity, updateEntityCount, updateLastFetch, addAlert]);

    useEffect(() => {
        if (!viewer || !enabled) {
            if (pointCollectionRef.current) {
                viewer?.scene.primitives.remove(pointCollectionRef.current);
                pointCollectionRef.current = null;
            }
            if (labelCollectionRef.current) {
                viewer?.scene.primitives.remove(labelCollectionRef.current);
                labelCollectionRef.current = null;
            }
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        setLayerLoading("flights", true);

        const points = new Cesium.PointPrimitiveCollection();
        const labels = new Cesium.LabelCollection();
        const trailDs = new Cesium.CustomDataSource("flight-trails");
        viewer.scene.primitives.add(points);
        viewer.scene.primitives.add(labels);
        viewer.dataSources.add(trailDs);
        pointCollectionRef.current = points;
        labelCollectionRef.current = labels;
        trailDataSourceRef.current = trailDs;

        updateFlights().finally(() => setLayerLoading("flights", false));
        intervalRef.current = setInterval(updateFlights, UPDATE_INTERVALS.flights);

        // Click handler
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const picked = viewer.scene.pick(click.position);
            if (picked?.id?.startsWith?.("flt-")) {
                const icao = picked.id.replace("flt-", "");
                const f = flightsRef.current.find((fl) => fl.icao24 === icao);
                if (f) {
                    const entity: FlightEntity = {
                        id: `flt-${f.icao24}`,
                        layerId: "flights",
                        name: f.callsign || f.icao24,
                        lat: f.lat,
                        lon: f.lon,
                        alt: f.altitude,
                        timestamp: Date.now(),
                        icao24: f.icao24,
                        callsign: f.callsign,
                        originCountry: f.originCountry,
                        velocity: f.velocity,
                        heading: f.heading,
                        verticalRate: f.verticalRate,
                        onGround: f.onGround,
                        squawk: f.squawk,
                    };
                    selectEntity(entity);

                    // Show flight trail from position history
                    if (trailDataSourceRef.current) {
                        trailDataSourceRef.current.entities.removeAll();
                        const history = positionHistoryRef.current.get(f.icao24);
                        if (history && history.length > 2) {
                            const trailPositions = history.map((h) =>
                                Cesium.Cartesian3.fromDegrees(h.lon, h.lat, h.alt)
                            );
                            trailDataSourceRef.current.entities.add({
                                polyline: {
                                    positions: trailPositions,
                                    width: 1.5,
                                    material: new Cesium.ColorMaterialProperty(
                                        Cesium.Color.fromCssColorString("#00ff41").withAlpha(0.5)
                                    ),
                                },
                            });
                        }
                    }
                }
            } else if (trailDataSourceRef.current) {
                trailDataSourceRef.current.entities.removeAll();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            handler.destroy();
            positionHistoryRef.current.clear();
            if (trailDataSourceRef.current) {
                viewer.dataSources.remove(trailDataSourceRef.current);
                trailDataSourceRef.current = null;
            }
            if (pointCollectionRef.current) {
                viewer.scene.primitives.remove(pointCollectionRef.current);
                pointCollectionRef.current = null;
            }
            if (labelCollectionRef.current) {
                viewer.scene.primitives.remove(labelCollectionRef.current);
                labelCollectionRef.current = null;
            }
        };
    }, [viewer, enabled, updateFlights, setLayerLoading, selectEntity]);

    return null;
}
