import { useCameraStore } from "@/stores/cameraStore";
import type { VisualMode, DetectionDensity } from "@/types/globe";

const VISUAL_MODES: { id: VisualMode; label: string; key: string }[] = [
  { id: "standard", label: "STD", key: "1" },
  { id: "crt", label: "CRT", key: "2" },
  { id: "nvg", label: "NVG", key: "3" },
  { id: "flir", label: "FLIR", key: "4" },
  { id: "tactical", label: "TAC", key: "5" },
];

const DENSITY_OPTIONS: { id: DetectionDensity; label: string }[] = [
  { id: "sparse", label: "SPARSE" },
  { id: "dense", label: "DENSE" },
];

export default function DetectionMode() {
  const visualMode = useCameraStore((s) => s.visualMode);
  const density = useCameraStore((s) => s.detectionDensity);
  const setVisualMode = useCameraStore((s) => s.setVisualMode);
  const setDensity = useCameraStore((s) => s.setDetectionDensity);

  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 bg-bg-panel/90 border border-border-dim px-2 py-1 font-mono text-[10px] backdrop-blur-sm">
      <span className="text-text-secondary mr-1">VIS</span>
      {VISUAL_MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setVisualMode(mode.id)}
          className={`px-1.5 py-0.5 border transition-colors ${
            visualMode === mode.id
              ? "border-accent-green text-accent-green bg-accent-green/10"
              : "border-border-dim text-text-dim hover:text-text-secondary hover:border-border-subtle"
          }`}
        >
          {mode.label}
          <span className="text-text-dim ml-0.5">{mode.key}</span>
        </button>
      ))}

      <div className="w-px h-4 bg-border-dim mx-1" />

      <span className="text-text-secondary mr-1">DET</span>
      {DENSITY_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setDensity(opt.id)}
          className={`px-1.5 py-0.5 border transition-colors ${
            density === opt.id
              ? "border-accent-amber text-accent-amber bg-accent-amber/10"
              : "border-border-dim text-text-dim hover:text-text-secondary hover:border-border-subtle"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
