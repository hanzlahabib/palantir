import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { useLayerStore } from "@/stores/layerStore";
import { useEntityStore } from "@/stores/entityStore";

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
    const pointsRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
    const vesselsRef = useRef<VesselData[]>([]);
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

        updateEntityCount("maritime", vessels.length);
        updateLastFetch("maritime");
    }, [updateEntityCount, updateLastFetch]);

    useEffect(() => {
        if (!viewer || !enabled) {
            if (pointsRef.current) { viewer?.scene.primitives.remove(pointsRef.current); pointsRef.current = null; }
            if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
            return;
        }

        setLayerLoading("maritime", true);
        const points = new Cesium.PointPrimitiveCollection();
        viewer.scene.primitives.add(points);
        pointsRef.current = points;

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
            if (pointsRef.current) { viewer.scene.primitives.remove(pointsRef.current); pointsRef.current = null; }
        };
    }, [viewer, enabled, connectWS, setLayerLoading, selectEntity]);

    return null;
}
