import { useState, useEffect } from "react";
import { APP_NAME, APP_VERSION, APP_CLASSIFICATION } from "@/config/constants";
import { formatUtcClock, formatNumber } from "@/utils/formatters";
import { useLayerStore } from "@/stores/layerStore";

export default function TopBar() {
  const [clock, setClock] = useState(formatUtcClock());
  const totalEntities = useLayerStore((s) => s.getTotalEntityCount());
  const enabledLayers = useLayerStore((s) => s.getEnabledLayers());

  useEffect(() => {
    const interval = setInterval(() => setClock(formatUtcClock()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-8 bg-bg-primary/90 border-b border-border-dim font-mono text-xs select-none backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <span className="text-accent-green font-bold tracking-widest">
          {APP_NAME}
        </span>
        <span className="text-text-dim">v{APP_VERSION}</span>
        <span className="text-accent-amber/70 text-[10px] tracking-wider">
          {APP_CLASSIFICATION}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-text-secondary">
          Feeds:{" "}
          <span className="text-accent-green">
            {enabledLayers.length}
          </span>
          <span className="text-text-dim">
            /{useLayerStore.getState().layers.length}
          </span>{" "}
          <span className="text-accent-green text-[10px]">ONLINE</span>
        </span>

        <span className="text-text-secondary">
          Entities:{" "}
          <span className="text-accent-cyan">
            {formatNumber(totalEntities)}
          </span>
        </span>

        <span className="text-accent-green font-bold tracking-wider">
          {clock}
        </span>
      </div>
    </div>
  );
}
