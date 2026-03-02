import { useCallback } from "react";
import * as Cesium from "cesium";
import type { CameraPreset } from "@/config/landmarks";

export function useCameraFlyTo(viewer: Cesium.Viewer | null) {
    const flyTo = useCallback((preset: CameraPreset, duration = 3) => {
        if (!viewer) return;
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(preset.lon, preset.lat, preset.height),
            orientation: {
                heading: Cesium.Math.toRadians(preset.heading),
                pitch: Cesium.Math.toRadians(preset.pitch),
                roll: 0,
            },
            duration,
            easingFunction: Cesium.EasingFunction.QUARTIC_IN_OUT,
        });
    }, [viewer]);

    const flyToCoords = useCallback((lon: number, lat: number, height: number, duration = 2) => {
        if (!viewer) return;
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
            duration,
            easingFunction: Cesium.EasingFunction.QUARTIC_IN_OUT,
        });
    }, [viewer]);

    const resetView = useCallback(() => {
        if (!viewer) return;
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(0, 20, 20_000_000),
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
            duration: 3,
            easingFunction: Cesium.EasingFunction.QUARTIC_IN_OUT,
        });
    }, [viewer]);

    return { flyTo, flyToCoords, resetView };
}
