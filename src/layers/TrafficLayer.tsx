import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { useLayerStore } from "@/stores/layerStore";

interface TrafficLayerProps {
    viewer: Cesium.Viewer | null;
}

interface RoadSegment {
    coords: [number, number][];
    type: string;
}

const ROAD_SPEEDS: Record<string, number> = {
    motorway: 110,
    trunk: 90,
    primary: 60,
    secondary: 40,
};

const ROAD_DENSITY: Record<string, number> = {
    motorway: 15,
    trunk: 10,
    primary: 6,
    secondary: 3,
};

const MAX_PARTICLES = 8000;

export default function TrafficLayer({ viewer }: TrafficLayerProps) {
    const enabled = useLayerStore((s) => s.getLayer("traffic")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
    const pointsRef = useRef<Cesium.PointPrimitiveCollection | null>(null);
    const animRef = useRef<number>(0);
    const particlesRef = useRef<{ segIdx: number; progress: number; speed: number }[]>([]);
    const roadsRef = useRef<RoadSegment[]>([]);

    const loadRoads = useCallback(async () => {
        if (!viewer) return;

        // Get current camera bounding box
        const rect = viewer.camera.computeViewRectangle();
        if (!rect) return;

        const south = Cesium.Math.toDegrees(rect.south);
        const west = Cesium.Math.toDegrees(rect.west);
        const north = Cesium.Math.toDegrees(rect.north);
        const east = Cesium.Math.toDegrees(rect.east);

        // Only load traffic for small enough area
        if (Math.abs(north - south) > 2 || Math.abs(east - west) > 2) return;

        try {
            const resp = await fetch(`/api/roads?south=${south}&west=${west}&north=${north}&east=${east}`);
            if (!resp.ok) return;
            const data = await resp.json();

            const nodeMap = new Map<number, [number, number]>();
            for (const el of data.elements || []) {
                if (el.type === "node") nodeMap.set(el.id, [el.lon, el.lat]);
            }

            const roads: RoadSegment[] = [];
            for (const el of data.elements || []) {
                if (el.type !== "way" || !el.nodes || !el.tags) continue;
                const coords: [number, number][] = el.nodes
                    .map((id: number) => nodeMap.get(id))
                    .filter(Boolean) as [number, number][];
                if (coords.length < 2) continue;
                roads.push({ coords, type: el.tags.highway || "secondary" });
            }

            roadsRef.current = roads;
            initParticles(roads);
        } catch (err) {
            console.error("[TrafficLayer] Road fetch failed:", err);
        }
    }, [viewer]);

    function initParticles(roads: RoadSegment[]) {
        const particles: typeof particlesRef.current = [];
        let total = 0;

        for (let i = 0; i < roads.length && total < MAX_PARTICLES; i++) {
            const seg = roads[i];
            const density = ROAD_DENSITY[seg.type] || 3;
            const segLen = seg.coords.length;
            const count = Math.min(Math.ceil(segLen * density / 10), MAX_PARTICLES - total);

            for (let j = 0; j < count; j++) {
                particles.push({
                    segIdx: i,
                    progress: Math.random(),
                    speed: (ROAD_SPEEDS[seg.type] || 40) * (0.7 + Math.random() * 0.6),
                });
                total++;
            }
        }

        particlesRef.current = particles;
    }

    const animate = useCallback(() => {
        if (!pointsRef.current || roadsRef.current.length === 0) return;
        const points = pointsRef.current;
        const particles = particlesRef.current;
        const roads = roadsRef.current;
        const dt = 0.0002; // time step

        while (points.length < particles.length) {
            points.add({ position: Cesium.Cartesian3.ZERO, pixelSize: 2, color: Cesium.Color.fromCssColorString("#ffff44").withAlpha(0.7), show: false });
        }

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.progress += dt * (p.speed / 60);
            if (p.progress >= 1) p.progress = 0;

            const road = roads[p.segIdx];
            const idx = Math.floor(p.progress * (road.coords.length - 1));
            const frac = (p.progress * (road.coords.length - 1)) - idx;
            const c1 = road.coords[Math.min(idx, road.coords.length - 1)];
            const c2 = road.coords[Math.min(idx + 1, road.coords.length - 1)];

            const lon = c1[0] + (c2[0] - c1[0]) * frac;
            const lat = c1[1] + (c2[1] - c1[1]) * frac;

            const pt = points.get(i);
            pt.position = Cesium.Cartesian3.fromDegrees(lon, lat, 10);
            pt.show = true;
        }

        for (let i = particles.length; i < points.length; i++) {
            points.get(i).show = false;
        }

        updateEntityCount("traffic", particles.length);
        animRef.current = requestAnimationFrame(animate);
    }, [updateEntityCount]);

    useEffect(() => {
        if (!viewer || !enabled) {
            cancelAnimationFrame(animRef.current);
            if (pointsRef.current) { viewer?.scene.primitives.remove(pointsRef.current); pointsRef.current = null; }
            return;
        }

        setLayerLoading("traffic", true);
        const points = new Cesium.PointPrimitiveCollection();
        viewer.scene.primitives.add(points);
        pointsRef.current = points;

        loadRoads().then(() => {
            setLayerLoading("traffic", false);
            animate();
        });

        return () => {
            cancelAnimationFrame(animRef.current);
            if (pointsRef.current) { viewer.scene.primitives.remove(pointsRef.current); pointsRef.current = null; }
        };
    }, [viewer, enabled, loadRoads, animate, setLayerLoading]);

    return null;
}
