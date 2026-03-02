import { useCameraStore } from "@/stores/cameraStore";

export default function ClassifiedWatermark() {
  const visualMode = useCameraStore((s) => s.visualMode);

  if (visualMode === "standard") return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden select-none">
      <div className="absolute inset-0 flex items-center justify-center -rotate-45">
        <span className="text-alert-red/[0.04] text-[120px] font-bold tracking-[0.3em] whitespace-nowrap">
          TOP SECRET // SCI
        </span>
      </div>
    </div>
  );
}
