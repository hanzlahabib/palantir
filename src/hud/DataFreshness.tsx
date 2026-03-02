import { useLayerStore } from "@/stores/layerStore";
import { timeAgo } from "@/utils/formatters";
import type { FeedStatus } from "@/types/layers";

function getStatusIndicator(lastUpdate: number | null, enabled: boolean): { status: FeedStatus; color: string } {
  if (!enabled) return { status: "offline", color: "text-text-dim" };
  if (!lastUpdate) return { status: "offline", color: "text-text-dim" };
  const age = Date.now() - lastUpdate;
  if (age < 60_000) return { status: "online", color: "text-accent-green" };
  if (age < 300_000) return { status: "degraded", color: "text-alert-amber" };
  return { status: "stale", color: "text-alert-red" };
}

export default function DataFreshness() {
  const layers = useLayerStore((s) => s.layers);
  const enabledLayers = layers.filter((l) => l.enabled);

  if (enabledLayers.length === 0) return null;

  return (
    <div className="fixed top-10 right-2 z-40 bg-bg-panel/95 border border-border-dim p-2 font-mono text-[10px] min-w-[160px] backdrop-blur-sm">
      <div className="text-text-secondary mb-1 tracking-wider">FEED STATUS</div>
      {enabledLayers.map((layer) => {
        const { status, color } = getStatusIndicator(layer.lastUpdate, layer.enabled);
        return (
          <div key={layer.id} className="flex items-center justify-between gap-2 py-0.5">
            <span className="text-text-secondary">{layer.shortName}</span>
            <div className="flex items-center gap-1">
              <span className={`${color} uppercase`}>{status}</span>
              {layer.lastUpdate && (
                <span className="text-text-dim">{timeAgo(layer.lastUpdate)}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
