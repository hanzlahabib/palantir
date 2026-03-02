import { useCallback, useState } from "react";
import * as Cesium from "cesium";
import { LANDMARK_PRESETS, getPresetGroups, type CameraPreset } from "@/config/landmarks";

interface CameraPresetsProps {
  viewer: Cesium.Viewer | null;
}

export default function CameraPresets({ viewer }: CameraPresetsProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const groups = getPresetGroups();

  const flyTo = useCallback(
    (preset: CameraPreset) => {
      if (!viewer) return;
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

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-9 left-1/2 -translate-x-1/2 z-40 bg-bg-panel/90 border border-border-dim px-3 py-1 font-mono text-[10px] text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/30 transition-colors backdrop-blur-sm"
      >
        CAMERA PRESETS
      </button>
    );
  }

  return (
    <div className="fixed bottom-9 left-1/2 -translate-x-1/2 z-40 bg-bg-panel/95 border border-border-dim font-mono text-[10px] backdrop-blur-sm max-w-[600px]">
      <div className="flex items-center justify-between px-2 py-1 border-b border-border-dim">
        <span className="text-text-secondary tracking-wider">CAMERA PRESETS</span>
        <button
          onClick={() => setExpanded(false)}
          className="text-text-dim hover:text-alert-red"
        >
          X
        </button>
      </div>

      <div className="flex gap-0.5 px-1 py-1 border-b border-border-dim">
        {groups.map((group: string) => (
          <button
            key={group}
            onClick={() => setActiveGroup(activeGroup === group ? null : group)}
            className={`px-2 py-0.5 border transition-colors ${
              activeGroup === group
                ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10"
                : "border-border-dim text-text-dim hover:text-text-secondary"
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-0.5 p-1 max-h-[120px] overflow-y-auto">
        {LANDMARK_PRESETS.filter((p: CameraPreset) => !activeGroup || p.group === activeGroup).map((preset: CameraPreset) => (
          <button
            key={preset.name}
            onClick={() => flyTo(preset)}
            className="px-2 py-0.5 border border-border-dim text-text-secondary hover:text-accent-green hover:border-accent-green/30 transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}
