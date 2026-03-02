import { useCallback, useState, useEffect, useRef } from "react";
import * as Cesium from "cesium";

interface CameraFeed {
    id: string;
    name: string;
    city: string;
    lat: number;
    lon: number;
    imageUrl: string;
}

interface CCTVPanelProps {
    viewer: Cesium.Viewer | null;
}

export default function CCTVPanel({ viewer }: CCTVPanelProps) {
    const [open, setOpen] = useState(false);
    const [city, setCity] = useState<"austin" | "nyc" | "london">("austin");
    const [cameras, setCameras] = useState<CameraFeed[]>([]);
    const [selectedCam, setSelectedCam] = useState<CameraFeed | null>(null);
    const [imageKey, setImageKey] = useState(0);
    const refreshRef = useRef<NodeJS.Timeout | null>(null);

    const loadCameras = useCallback(async () => {
        try {
            const resp = await fetch(`/api/cctv/${city}`);
            if (!resp.ok) return;
            const data = await resp.json();
            const list = data.cameras || (Array.isArray(data) ? data : []);
            const cams: CameraFeed[] = list
                .filter((c: any) => c.imageUrl || c.videoUrl)
                .slice(0, 30)
                .map((c: any, i: number) => ({
                    id: c.id || c.cameraID || `${city}-${i}`,
                    name: c.name || c.commonName || `Camera ${i + 1}`,
                    city,
                    lat: c.lat || 0,
                    lon: c.lon || 0,
                    imageUrl: c.imageUrl || c.videoUrl || "",
                }));
            setCameras(cams);
        } catch {
            setCameras([]);
        }
    }, [city]);

    useEffect(() => {
        if (open) loadCameras();
    }, [open, city, loadCameras]);

    useEffect(() => {
        if (selectedCam) {
            refreshRef.current = setInterval(() => setImageKey((k) => k + 1), 30_000);
        }
        return () => {
            if (refreshRef.current) clearInterval(refreshRef.current);
        };
    }, [selectedCam]);

    const jumpToCamera = useCallback((cam: CameraFeed) => {
        if (!viewer || !cam.lat || !cam.lon) return;
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(cam.lon, cam.lat, 500),
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
            duration: 2,
        });
    }, [viewer]);

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed top-10 left-[280px] z-40 bg-bg-panel/90 border border-border-dim px-2 py-1 font-mono text-[10px] text-text-dim hover:text-text-secondary hover:border-accent-cyan/30 transition-colors backdrop-blur-sm"
            >
                CCTV
            </button>
        );
    }

    return (
        <div className="fixed top-10 left-[280px] z-40 bg-bg-panel/95 border border-border-dim font-mono text-[10px] backdrop-blur-sm w-[300px] max-h-[420px] flex flex-col">
            <div className="flex items-center justify-between px-2 py-1 border-b border-border-dim">
                <span className="text-text-secondary tracking-wider">CCTV SURVEILLANCE</span>
                <button onClick={() => { setOpen(false); setSelectedCam(null); }} className="text-text-dim hover:text-alert-red">X</button>
            </div>

            <div className="flex gap-1 px-2 py-1 border-b border-border-dim">
                {(["austin", "nyc", "london"] as const).map((c) => (
                    <button
                        key={c}
                        onClick={() => { setCity(c); setSelectedCam(null); }}
                        className={`px-2 py-0.5 border uppercase transition-colors ${city === c
                            ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10"
                            : "border-border-dim text-text-dim hover:text-text-secondary"
                        }`}
                    >
                        {c}
                    </button>
                ))}
                <span className="ml-auto text-text-dim">{cameras.length} feeds</span>
            </div>

            {selectedCam ? (
                <div className="flex flex-col">
                    <div className="relative bg-black aspect-video">
                        <img
                            key={imageKey}
                            src={`/api/cctv/${selectedCam.city}/${selectedCam.id}/image?t=${Date.now()}`}
                            alt={selectedCam.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                        />
                        <div className="absolute top-1 left-1 text-accent-green text-[8px] bg-black/70 px-1">
                            LIVE -- {selectedCam.name}
                        </div>
                        <div className="absolute bottom-1 right-1 text-text-dim text-[8px] bg-black/70 px-1">
                            30s refresh
                        </div>
                    </div>
                    <div className="flex border-t border-border-dim">
                        <button
                            onClick={() => setSelectedCam(null)}
                            className="flex-1 px-2 py-1 text-text-dim hover:text-text-secondary border-r border-border-dim"
                        >
                            BACK
                        </button>
                        <button
                            onClick={() => jumpToCamera(selectedCam)}
                            className="flex-1 px-2 py-1 text-accent-cyan hover:text-accent-green"
                        >
                            FLY TO CAM
                        </button>
                    </div>
                </div>
            ) : (
                <div className="overflow-y-auto max-h-[300px]">
                    {cameras.length === 0 ? (
                        <div className="px-2 py-4 text-center text-text-dim">No feeds available</div>
                    ) : (
                        cameras.map((cam) => (
                            <button
                                key={cam.id}
                                onClick={() => setSelectedCam(cam)}
                                className="w-full text-left px-2 py-1 border-b border-border-dim/50 hover:bg-accent-cyan/5 hover:text-accent-cyan transition-colors flex items-center gap-2"
                            >
                                <span className="text-text-dim">CAM</span>
                                <span className="text-text-secondary truncate flex-1">{cam.name}</span>
                                {cam.lat !== 0 && (
                                    <span
                                        onClick={(e) => { e.stopPropagation(); jumpToCamera(cam); }}
                                        className="text-accent-cyan hover:text-accent-green cursor-pointer px-1"
                                        title="Fly to camera location"
                                    >
                                        GO
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
