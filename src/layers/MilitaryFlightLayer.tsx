import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { fetchMilitaryFlights, type MilitaryFlight } from "@/services/militaryFlightService";
import { identifyCallsign, getClassificationColor, HOTSPOTS } from "@/config/militaryCallsigns";
import { useLayerStore } from "@/stores/layerStore";
import { useEntityStore } from "@/stores/entityStore";
import { useAlertStore } from "@/stores/alertStore";
import { useCameraStore } from "@/stores/cameraStore";
import { UPDATE_INTERVALS } from "@/config/constants";
import { haversineDistance } from "@/utils/coordinateUtils";
import type { MilitaryFlightEntity } from "@/types/entities";

interface MilitaryFlightLayerProps {
    viewer: Cesium.Viewer | null;
}

export default function MilitaryFlightLayer({ viewer }: MilitaryFlightLayerProps) {
    const enabled = useLayerStore((s) => s.getLayer("military")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const updateLastFetch = useLayerStore((s) => s.updateLastFetch);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
    const selectEntity = useEntityStore((s) => s.selectEntity);
    const addAlert = useAlertStore((s) => s.addAlert);
    const detectionDensity = useCameraStore((s) => s.detectionDensity);
    const seenHotspotAlertsRef = useRef<Set<string>>(new Set());
    const pointsRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
    const labelsRef = useRef<Cesium.LabelCollection | null>(null);
    const flightsRef = useRef<MilitaryFlight[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const update = useCallback(async () => {
        if (!viewer || !pointsRef.current) return;
        try {
            const flights = await fetchMilitaryFlights();
            flightsRef.current = flights;
            const points = pointsRef.current;
            const labels = labelsRef.current;

            while (points.length < flights.length) {
                points.add({ position: Cesium.Cartesian3.ZERO, pixelSize: 5, show: false });
            }
            if (labels) {
                while (labels.length < flights.length) {
                    labels.add({ position: Cesium.Cartesian3.ZERO, text: "", font: "10px JetBrains Mono", fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE, pixelOffset: new Cesium.Cartesian2(8, 0), show: false, scale: 0.7 });
                }
            }

            for (let i = 0; i < flights.length; i++) {
                const f = flights[i];
                const callsign = (f.flight || "").trim();
                const identified = identifyCallsign(callsign);
                const color = identified
                    ? Cesium.Color.fromCssColorString(getClassificationColor(identified.classification))
                    : Cesium.Color.fromCssColorString("#ff6600");

                const pos = Cesium.Cartesian3.fromDegrees(f.lon, f.lat, (f.alt_baro || 0) * 0.3048);
                const pt = points.get(i);
                pt.position = pos;
                pt.pixelSize = identified?.classification === "vip" ? 8 : 5;
                pt.color = color;
                pt.show = true;
                (pt as any).id = `mil-${f.hex}`;

                if (labels && i < labels.length) {
                    const lbl = labels.get(i);
                    lbl.position = pos;
                    lbl.text = detectionDensity === "dense" ? (callsign || f.hex) : "";
                    lbl.fillColor = color;
                    lbl.show = detectionDensity === "dense";
                }
            }

            for (let i = flights.length; i < points.length; i++) points.get(i).show = false;
            if (labels) for (let i = flights.length; i < labels.length; i++) labels.get(i).show = false;

            // Hotspot proximity alerts
            for (const f of flights) {
                for (const hotspot of HOTSPOTS) {
                    const dist = haversineDistance(f.lat, f.lon, hotspot.lat, hotspot.lon);
                    if (dist < hotspot.radiusKm * 1000) {
                        const alertKey = `${f.hex}-${hotspot.name}`;
                        if (!seenHotspotAlertsRef.current.has(alertKey)) {
                            seenHotspotAlertsRef.current.add(alertKey);
                            const callsign = (f.flight || "").trim();
                            addAlert({
                                id: `mil-hotspot-${alertKey}-${Date.now()}`,
                                timestamp: Date.now(),
                                level: "high",
                                title: `MILITARY NEAR ${hotspot.name.toUpperCase()}`,
                                description: `${callsign || f.hex} detected within ${(dist / 1000).toFixed(0)}km of ${hotspot.name}`,
                                source: "military",
                                lat: f.lat,
                                lon: f.lon,
                            });
                        }
                    }
                }
            }

            updateEntityCount("military", flights.length);
            updateLastFetch("military");
        } catch (err) {
            console.error("[MilitaryFlightLayer] Update failed:", err);
        }
    }, [viewer, detectionDensity, updateEntityCount, updateLastFetch]);

    useEffect(() => {
        if (!viewer || !enabled) {
            if (pointsRef.current) { viewer?.scene.primitives.remove(pointsRef.current); pointsRef.current = null; }
            if (labelsRef.current) { viewer?.scene.primitives.remove(labelsRef.current); labelsRef.current = null; }
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        setLayerLoading("military", true);
        const points = new Cesium.PointPrimitiveCollection();
        const labels = new Cesium.LabelCollection();
        viewer.scene.primitives.add(points);
        viewer.scene.primitives.add(labels);
        pointsRef.current = points;
        labelsRef.current = labels;

        update().finally(() => setLayerLoading("military", false));
        intervalRef.current = setInterval(update, UPDATE_INTERVALS.military);

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const picked = viewer.scene.pick(click.position);
            if (picked?.id?.startsWith?.("mil-")) {
                const hex = picked.id.replace("mil-", "");
                const f = flightsRef.current.find((fl) => fl.hex === hex);
                if (f) {
                    const callsign = (f.flight || "").trim();
                    const identified = identifyCallsign(callsign);
                    const entity: MilitaryFlightEntity = {
                        id: `mil-${f.hex}`, layerId: "military", name: callsign || f.hex,
                        lat: f.lat, lon: f.lon, alt: (f.alt_baro || 0) * 0.3048, timestamp: Date.now(),
                        icao24: f.hex, callsign, originCountry: identified?.nation || "Unknown",
                        velocity: f.gs * 0.514444, heading: f.track, verticalRate: (f.baro_rate || 0) * 0.00508,
                        onGround: false, squawk: f.squawk,
                        operator: identified?.operator || "Unknown", aircraftType: identified?.type || f.t || "Unknown",
                        classification: (identified?.classification || "unknown") as any,
                    };
                    selectEntity(entity);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            handler.destroy();
            if (pointsRef.current) { viewer.scene.primitives.remove(pointsRef.current); pointsRef.current = null; }
            if (labelsRef.current) { viewer.scene.primitives.remove(labelsRef.current); labelsRef.current = null; }
        };
    }, [viewer, enabled, update, setLayerLoading, selectEntity]);

    return null;
}
