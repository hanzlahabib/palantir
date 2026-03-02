import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { useLayerStore } from "@/stores/layerStore";
import { useEntityStore } from "@/stores/entityStore";
import { useAlertStore } from "@/stores/alertStore";
import type { VesselEntity } from "@/types/entities";

interface MaritimeLayerProps {
    viewer: Cesium.Viewer | null;
}

interface VesselData {
    mmsi: string;
    name: string;
    lat: number;
    lon: number;
    speed: number;
    heading: number;
    vesselType: string;
    destination: string | null;
    flag: string | null;
}

function classifyVesselType(type: number): string {
    if (type === 30) return "fishing";
    if (type === 35) return "military";
    if (type >= 60 && type <= 69) return "passenger";
    if (type >= 70 && type <= 79) return "cargo";
    if (type >= 80 && type <= 89) return "tanker";
    return "unknown";
}

function getVesselColor(type: string): string {
    switch (type) {
        case "fishing": return "#44ff44";
        case "military": return "#ff4444";
        case "passenger": return "#4488ff";
        case "cargo": return "#888888";
        case "tanker": return "#ff8844";
        default: return "#ffff44";
    }
}

export default function MaritimeLayer({ viewer }: MaritimeLayerProps) {
    const enabled = useLayerStore((s) => s.getLayer("maritime")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const updateLastFetch = useLayerStore((s) => s.updateLastFetch);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
    const selectEntity = useEntityStore((s) => s.selectEntity);
    const addAlert = useAlertStore((s) => s.addAlert);
    const pointsRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
    const speedVectorDsRef = useRef<Cesium.CustomDataSource | null>(null);
    const vesselsRef = useRef<VesselData[]>([]);
    const prevPositionsRef = useRef<Map<string, { lat: number; lon: number; time: number }>>(new Map());
    const seenAnomaliesRef = useRef<Set<string>>(new Set());
    const wsRef = useRef<WebSocket | null>(null);

    const connectWS = useCallback(() => {
        if (!viewer) return;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "subscribe", channel: "maritime" }));
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "data" && msg.channel === "maritime" && Array.isArray(msg.data)) {
                    updateVessels(msg.data);
                }
                if (msg.type === "ping") {
                    ws.send(JSON.stringify({ type: "pong" }));
                }
            } catch { /* ignore */ }
        };

        ws.onclose = () => {
            // Auto-reconnect after 5s
            setTimeout(connectWS, 5000);
        };
    }, [viewer]);

    const updateVessels = useCallback((data: any[]) => {
        if (!pointsRef.current) return;
        const points = pointsRef.current;

        const vessels: VesselData[] = data.map((v: any) => ({
            mmsi: v.mmsi || v.MMSI || "",
            name: v.name || v.ShipName || "Unknown",
            lat: v.lat || v.Latitude || 0,
            lon: v.lon || v.Longitude || 0,
            speed: v.speed || v.SOG || 0,
            heading: v.heading || v.COG || 0,
            vesselType: classifyVesselType(v.shipType || v.ShipType || 0),
            destination: v.destination || v.Destination || null,
            flag: v.flag || null,
        }));

        vesselsRef.current = vessels;

        while (points.length < vessels.length) {
            points.add({ position: Cesium.Cartesian3.ZERO, pixelSize: 4, show: false });
        }

        for (let i = 0; i < vessels.length; i++) {
            const v = vessels[i];
            const color = Cesium.Color.fromCssColorString(getVesselColor(v.vesselType));
            const pt = points.get(i);
            pt.position = Cesium.Cartesian3.fromDegrees(v.lon, v.lat);
            pt.pixelSize = v.vesselType === "military" ? 6 : 4;
            pt.color = color;
            pt.show = true;
            (pt as any).id = `ves-${v.mmsi}`;
        }

        for (let i = vessels.length; i < points.length; i++) points.get(i).show = false;

        // Speed vector lines — show projected position 5 min ahead
        if (speedVectorDsRef.current) {
            speedVectorDsRef.current.entities.removeAll();
            for (const v of vessels) {
                if (v.speed < 1 || !v.heading) continue;
                const speedMs = v.speed * 0.514444; // knots to m/s
                const distM = speedMs * 300; // 5 minutes
                const headingRad = (v.heading * Math.PI) / 180;
                const dLat = (distM * Math.cos(headingRad)) / 111320;
                const dLon = (distM * Math.sin(headingRad)) / (111320 * Math.cos((v.lat * Math.PI) / 180));
                const endLat = v.lat + dLat;
                const endLon = v.lon + dLon;
                const color = Cesium.Color.fromCssColorString(getVesselColor(v.vesselType)).withAlpha(0.4);
                speedVectorDsRef.current.entities.add({
                    polyline: {
                        positions: Cesium.Cartesian3.fromDegreesArray([v.lon, v.lat, endLon, endLat]),
                        width: 1,
                        material: new Cesium.ColorMaterialProperty(color),
                    },
                });
            }
        }

        // Anomaly detection
        const now = Date.now();
        for (const v of vessels) {
            const prev = prevPositionsRef.current.get(v.mmsi);
            if (prev) {
                const dt = (now - prev.time) / 1000;
                // Dark ship: same position for 30+ min but was previously moving
                if (dt > 1800 && v.speed < 0.5 && Math.abs(v.lat - prev.lat) < 0.001 && Math.abs(v.lon - prev.lon) < 0.001) {
                    const aKey = `dark-${v.mmsi}`;
                    if (!seenAnomaliesRef.current.has(aKey)) {
                        seenAnomaliesRef.current.add(aKey);
                        addAlert({
                            id: `ais-${aKey}-${now}`, timestamp: now, level: "medium",
                            title: `AIS ANOMALY: ${v.name}`,
                            description: `Vessel ${v.mmsi} stationary/dark for ${Math.round(dt / 60)}min`,
                            source: "maritime", lat: v.lat, lon: v.lon,
                        });
                    }
                }
                // Speed anomaly: sudden large speed change
                if (prev.time > 0 && dt < 600) {
                    const prevDist = Math.sqrt((v.lat - prev.lat) ** 2 + (v.lon - prev.lon) ** 2) * 111320;
                    const impliedSpeed = prevDist / dt;
                    if (v.speed > 30 && impliedSpeed < 2) {
                        const aKey = `spd-${v.mmsi}`;
                        if (!seenAnomaliesRef.current.has(aKey)) {
                            seenAnomaliesRef.current.add(aKey);
                            addAlert({
                                id: `ais-${aKey}-${now}`, timestamp: now, level: "low",
                                title: `SPEED ANOMALY: ${v.name}`,
                                description: `Reported ${v.speed.toFixed(0)}kts but GPS shows minimal movement`,
                                source: "maritime", lat: v.lat, lon: v.lon,
                            });
                        }
                    }
                }
            }
            prevPositionsRef.current.set(v.mmsi, { lat: v.lat, lon: v.lon, time: now });
        }

        updateEntityCount("maritime", vessels.length);
        updateLastFetch("maritime");
    }, [updateEntityCount, updateLastFetch, addAlert]);

    useEffect(() => {
        if (!viewer || !enabled) {
            if (pointsRef.current) { viewer?.scene.primitives.remove(pointsRef.current); pointsRef.current = null; }
            if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
            return;
        }

        setLayerLoading("maritime", true);
        const points = new Cesium.PointPrimitiveCollection();
        const vectorDs = new Cesium.CustomDataSource("vessel-vectors");
        viewer.scene.primitives.add(points);
        viewer.dataSources.add(vectorDs);
        pointsRef.current = points;
        speedVectorDsRef.current = vectorDs;

        connectWS();
        setLayerLoading("maritime", false);

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const picked = viewer.scene.pick(click.position);
            if (picked?.id?.startsWith?.("ves-")) {
                const mmsi = picked.id.replace("ves-", "");
                const v = vesselsRef.current.find((ve) => ve.mmsi === mmsi);
                if (v) {
                    const entity: VesselEntity = {
                        id: `ves-${v.mmsi}`, layerId: "maritime", name: v.name,
                        lat: v.lat, lon: v.lon, timestamp: Date.now(),
                        mmsi: v.mmsi, vesselType: v.vesselType as any, speed: v.speed,
                        heading: v.heading, destination: v.destination, flag: v.flag,
                    };
                    selectEntity(entity);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        return () => {
            handler.destroy();
            if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
            if (speedVectorDsRef.current) { viewer.dataSources.remove(speedVectorDsRef.current); speedVectorDsRef.current = null; }
            if (pointsRef.current) { viewer.scene.primitives.remove(pointsRef.current); pointsRef.current = null; }
        };
    }, [viewer, enabled, connectWS, setLayerLoading, selectEntity]);

    return null;
}
