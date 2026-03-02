import { useEffect, useRef, useCallback } from "react";
import * as Cesium from "cesium";
import { useCameraStore } from "@/stores/cameraStore";
import { LANDMARK_PRESETS, type CameraPreset } from "@/config/landmarks";

interface CameraControllerProps {
  viewer: Cesium.Viewer | null;
}

export default function CameraController({ viewer }: CameraControllerProps) {
  const isOrbiting = useCameraStore((s) => s.isOrbiting);
  const followingEntityId = useCameraStore((s) => s.followingEntityId);
  const orbitRef = useRef<(() => void) | null>(null);

  // Orbit mode — camera circles current target
  useEffect(() => {
    if (!viewer || !isOrbiting) {
      if (orbitRef.current) {
        viewer?.clock.onTick.removeEventListener(orbitRef.current);
        orbitRef.current = null;
      }
      return;
    }

    const orbitTick = () => {
      viewer.camera.rotateRight(0.002);
    };

    viewer.clock.onTick.addEventListener(orbitTick);
    orbitRef.current = orbitTick;

    return () => {
      if (orbitRef.current) {
        viewer.clock.onTick.removeEventListener(orbitRef.current);
        orbitRef.current = null;
      }
    };
  }, [viewer, isOrbiting]);

  // Follow entity mode
  useEffect(() => {
    if (!viewer || !followingEntityId) return;

    const entity = viewer.entities.getById(followingEntityId);
    if (entity) {
      viewer.trackedEntity = entity;
    }

    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.trackedEntity = undefined;
      }
    };
  }, [viewer, followingEntityId]);

  const flyToPreset = useCallback(
    (presetName: string) => {
      if (!viewer) return;
      const preset = LANDMARK_PRESETS.find(
        (p: CameraPreset) => p.name.toLowerCase() === presetName.toLowerCase()
      );
      if (!preset) return;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(preset.lon, preset.lat, preset.height),
        orientation: {
          heading: Cesium.Math.toRadians(preset.heading),
          pitch: Cesium.Math.toRadians(preset.pitch),
          roll: 0,
        },
        duration: 2,
      });
    },
    [viewer]
  );

  const flyToHome = useCallback(() => {
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0, 20, 20_000_000),
      duration: 2,
    });
  }, [viewer]);

  // Expose flyTo methods via window for command console
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__cameraFlyToPreset = flyToPreset;
    w.__cameraFlyToHome = flyToHome;
    return () => {
      const win = window as unknown as Record<string, unknown>;
      delete win.__cameraFlyToPreset;
      delete win.__cameraFlyToHome;
    };
  }, [flyToPreset, flyToHome]);

  return null;
}
