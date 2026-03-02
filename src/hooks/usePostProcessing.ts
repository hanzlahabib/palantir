import { useCallback } from "react";
import { useCameraStore } from "@/stores/cameraStore";
import type { VisualMode } from "@/types/globe";

export function usePostProcessing() {
  const visualMode = useCameraStore((s) => s.visualMode);
  const setVisualMode = useCameraStore((s) => s.setVisualMode);

  const cycleMode = useCallback(() => {
    const modes: VisualMode[] = ["standard", "crt", "nvg", "flir", "tactical"];
    const currentIndex = modes.indexOf(visualMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setVisualMode(modes[nextIndex]!);
  }, [visualMode, setVisualMode]);

  const isActive = visualMode !== "standard";

  return { visualMode, setVisualMode, cycleMode, isActive };
}
