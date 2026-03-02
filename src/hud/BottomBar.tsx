import { useCameraStore } from "@/stores/cameraStore";
import { formatCoordinate, formatAltitude, formatHeading } from "@/utils/coordinateUtils";

export default function BottomBar() {
  const camera = useCameraStore((s) => s.camera);
  const visualMode = useCameraStore((s) => s.visualMode);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-7 bg-bg-primary/90 border-t border-border-dim font-mono text-[10px] select-none backdrop-blur-sm">
      <div className="flex items-center gap-4 text-text-secondary">
        <span>
          LAT{" "}
          <span className="text-text-primary">
            {formatCoordinate(camera.latitude, true)}
          </span>
        </span>
        <span>
          LON{" "}
          <span className="text-text-primary">
            {formatCoordinate(camera.longitude, false)}
          </span>
        </span>
        <span>
          ALT{" "}
          <span className="text-accent-cyan">
            {formatAltitude(camera.height)}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-4 text-text-secondary">
        <span>
          HDG{" "}
          <span className="text-text-primary">
            {formatHeading(camera.heading)}
          </span>
        </span>
        <span>
          PIT{" "}
          <span className="text-text-primary">
            {camera.pitch.toFixed(1)}°
          </span>
        </span>
        <span>
          MODE{" "}
          <span className="text-accent-amber font-bold uppercase">
            {visualMode}
          </span>
        </span>
      </div>
    </div>
  );
}
