import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { useLayerStore } from "@/stores/layerStore";


interface CCTVLayerProps {
    viewer: Cesium.Viewer | null;
}

interface Camera {
    id: string;
    name: string;
    lat: number;
    lon: number;
    imageUrl?: string;
    city: string;
}

const CITY_CAMERAS: Record<string, { fetchUrl: string; parser: (data: any) => Camera[] }> = {
    nyc: {
        fetchUrl: "/api/cctv/nyc",
        parser: (data: any): Camera[] =>
            (Array.isArray(data) ? data : [])
                .filter((c: any) => c.latitude && c.longitude)
                .map((c: any) => ({
                    id: `nyc-${c.id || c.cameraID}`,
                    name: c.name || `NYC Camera`,
                    lat: parseFloat(c.latitude),
                    lon: parseFloat(c.longitude),
                    imageUrl: c.imageUrl || c.videoUrl,
                    city: "nyc",
                })),
    },
    london: {
        fetchUrl: "/api/cctv/london",
        parser: (data: any): Camera[] =>
            (Array.isArray(data) ? data : [])
                .filter((c: any) => c.lat && c.lon)
                .map((c: any) => ({
                    id: `london-${c.id}`,
                    name: c.commonName || "London JamCam",
                    lat: c.lat,
                    lon: c.lon,
                    imageUrl: c.additionalProperties?.find?.((p: any) => p.key === "imageUrl")?.value,
                    city: "london",
                })),
    },
};

export default function CCTVLayer({ viewer }: CCTVLayerProps) {
    const enabled = useLayerStore((s) => s.getLayer("cctv")?.enabled);
    const updateEntityCount = useLayerStore((s) => s.updateEntityCount);
    const updateLastFetch = useLayerStore((s) => s.updateLastFetch);
    const setLayerLoading = useLayerStore((s) => s.setLayerLoading);
    const dsRef = useRef<Cesium.CustomDataSource | null>(null);

    const loadCameras = useCallback(async () => {
        if (!viewer || !dsRef.current) return;
        const ds = dsRef.current;
        ds.entities.removeAll();
        let totalCameras = 0;

        for (const [cityId, config] of Object.entries(CITY_CAMERAS)) {
            try {
                const resp = await fetch(config.fetchUrl);
                if (!resp.ok) continue;
                const data = await resp.json();
                const cameras = config.parser(data);
                totalCameras += cameras.length;

                for (const cam of cameras) {
                    ds.entities.add({
                        id: cam.id,
                        position: Cesium.Cartesian3.fromDegrees(cam.lon, cam.lat),
                        point: {
                            pixelSize: 5,
                            color: Cesium.Color.fromCssColorString("#aaaaaa").withAlpha(0.8),
                            outlineColor: Cesium.Color.WHITE,
                            outlineWidth: 1,
                            scaleByDistance: new Cesium.NearFarScalar(1000, 1.5, 500000, 0.3),
                        },
                        label: {
                            text: "📷",
                            font: "12px sans-serif",
                            pixelOffset: new Cesium.Cartesian2(0, -12),
                            scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 500000, 0.0),
                        },
                    });
                }
            } catch (err) {
                console.error(`[CCTVLayer] Failed to load ${cityId}:`, err);
            }
        }

        updateEntityCount("cctv", totalCameras);
        updateLastFetch("cctv");
    }, [viewer, updateEntityCount, updateLastFetch]);

    useEffect(() => {
        if (!viewer || !enabled) {
            if (dsRef.current) { viewer?.dataSources.remove(dsRef.current); dsRef.current = null; }
            return;
        }

        setLayerLoading("cctv", true);
        const ds = new Cesium.CustomDataSource("cctv");
        viewer.dataSources.add(ds);
        dsRef.current = ds;

        loadCameras().finally(() => setLayerLoading("cctv", false));

        return () => {
            if (dsRef.current) { viewer.dataSources.remove(dsRef.current); dsRef.current = null; }
        };
    }, [viewer, enabled, loadCameras, setLayerLoading]);

    return null;
}
