import { useCameraStore } from "@/stores/cameraStore";

export default function MiniMap() {
  const camera = useCameraStore((s) => s.camera);

  const x = ((camera.longitude + 180) / 360) * 100;
  const y = ((90 - camera.latitude) / 180) * 100;

  return (
    <div className="fixed bottom-9 left-2 z-40 bg-bg-panel/95 border border-border-dim p-1 font-mono backdrop-blur-sm">
      <div className="relative w-[120px] h-[60px] bg-bg-primary border border-border-dim overflow-hidden">
        {/* Simple world outline using gradients */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[15%] left-[10%] w-[15%] h-[30%] border border-accent-green/40" />
          <div className="absolute top-[10%] left-[30%] w-[20%] h-[35%] border border-accent-green/40" />
          <div className="absolute top-[20%] left-[55%] w-[25%] h-[40%] border border-accent-green/40" />
          <div className="absolute top-[55%] left-[60%] w-[15%] h-[20%] border border-accent-green/40" />
          <div className="absolute top-[60%] left-[15%] w-[10%] h-[15%] border border-accent-green/40" />
        </div>

        {/* Camera position indicator */}
        <div
          className="absolute w-1.5 h-1.5 bg-accent-green rounded-full"
          style={{
            left: `${Math.max(0, Math.min(100, x))}%`,
            top: `${Math.max(0, Math.min(100, y))}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 4px #00ff41",
          }}
        />

        {/* Crosshair */}
        <div
          className="absolute w-3 h-3 border border-accent-cyan/50"
          style={{
            left: `${Math.max(0, Math.min(100, x))}%`,
            top: `${Math.max(0, Math.min(100, y))}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
      <div className="text-[8px] text-text-dim text-center mt-0.5">OVERVIEW</div>
    </div>
  );
}
