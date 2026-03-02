import { useEffect } from "react";
import * as Cesium from "cesium";
import { useCameraStore } from "@/stores/cameraStore";
import { useLayerStore } from "@/stores/layerStore";
import { VISUAL_MODE_KEYS } from "@/config/constants";
import { LANDMARK_PRESETS } from "@/config/landmarks";
import type { VisualMode } from "@/types/globe";

export function useKeyboardShortcuts(viewer: Cesium.Viewer | null) {
    const setVisualMode = useCameraStore((s) => s.setVisualMode);
    const toggleOrbit = useCameraStore((s) => s.toggleOrbit);
    const toggleLayer = useLayerStore((s) => s.toggleLayer);
    const layers = useLayerStore((s) => s.layers);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Don't intercept if typing in input
            if (
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA"
            ) return;

            // Visual mode shortcuts (1-5)
            if (VISUAL_MODE_KEYS[e.key]) {
                e.preventDefault();
                setVisualMode(VISUAL_MODE_KEYS[e.key] as VisualMode);
                return;
            }

            // Layer toggle shortcuts (F1-F11)
            if (e.key.startsWith("F") && !e.shiftKey) {
                const fNum = parseInt(e.key.replace("F", ""), 10);
                if (fNum >= 1 && fNum <= layers.length) {
                    e.preventDefault();
                    toggleLayer(layers[fNum - 1].id);
                    return;
                }
            }

            // Space - Toggle orbit
            if (e.key === " " && !e.shiftKey) {
                e.preventDefault();
                toggleOrbit();
                return;
            }

            // Home - Return to orbital view
            if (e.key === "Home") {
                e.preventDefault();
                if (viewer) {
                    viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(0, 20, 20_000_000),
                        orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
                        duration: 3,
                    });
                }
                return;
            }

            // Shift+1-9: Jump to city preset groups
            if (e.shiftKey && e.key >= "1" && e.key <= "9") {
                e.preventDefault();
                const groups = [...new Set(LANDMARK_PRESETS.map((p) => p.group))];
                const idx = parseInt(e.key, 10) - 1;
                if (idx < groups.length && viewer) {
                    const presets = LANDMARK_PRESETS.filter((p) => p.group === groups[idx]);
                    if (presets.length > 0) {
                        const preset = presets[0];
                        viewer.camera.flyTo({
                            destination: Cesium.Cartesian3.fromDegrees(preset.lon, preset.lat, preset.height),
                            orientation: {
                                heading: Cesium.Math.toRadians(preset.heading),
                                pitch: Cesium.Math.toRadians(preset.pitch),
                                roll: 0,
                            },
                            duration: 3,
                            easingFunction: Cesium.EasingFunction.QUARTIC_IN_OUT,
                        });
                    }
                }
                return;
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [viewer, setVisualMode, toggleOrbit, toggleLayer, layers]);
}
