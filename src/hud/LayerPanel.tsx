import { useLayerStore } from "@/stores/layerStore";
import type { LayerId } from "@/types/layers";
import { useState } from "react";

export default function LayerPanel() {
    const [collapsed, setCollapsed] = useState(false);
    const layers = useLayerStore((s) => s.layers);
    const toggleLayer = useLayerStore((s) => s.toggleLayer);

    return (
        <div
            className={`fixed top-8 left-0 z-40 transition-all duration-300 ${collapsed ? "w-10" : "w-52"
                }`}
        >
            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-6 top-2 w-6 h-6 bg-bg-panel border border-border-dim text-text-dim text-[10px] font-mono flex items-center justify-center hover:text-accent-green hover:border-border-subtle cursor-pointer"
            >
                {collapsed ? "▸" : "◂"}
            </button>

            {collapsed ? (
                <div className="bg-bg-panel/90 backdrop-blur-sm border-r border-border-dim h-[calc(100vh-60px)] p-1 flex flex-col gap-1 items-center pt-2">
                    {layers.map((layer) => (
                        <button
                            key={layer.id}
                            onClick={() => toggleLayer(layer.id)}
                            className={`w-7 h-7 text-[8px] font-mono font-bold border cursor-pointer flex items-center justify-center ${layer.enabled
                                    ? "border-accent-green/50 text-accent-green bg-accent-green/10"
                                    : "border-border-dim text-text-dim hover:text-text-secondary hover:border-border-subtle"
                                }`}
                            title={layer.name}
                        >
                            {layer.shortName.slice(0, 2)}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="bg-bg-panel/90 backdrop-blur-sm border-r border-border-dim h-[calc(100vh-60px)] overflow-y-auto">
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-border-dim">
                        <span className="text-[10px] text-text-dim tracking-widest uppercase">
                            Data Layers
                        </span>
                    </div>

                    {/* Layer list */}
                    <div className="p-1">
                        {layers.map((layer) => (
                            <LayerToggle
                                key={layer.id}
                                id={layer.id}
                                shortName={layer.shortName}
                                name={layer.name}
                                enabled={layer.enabled}
                                loading={layer.loading}
                                entityCount={layer.entityCount}
                                color={layer.color}
                                keybind={layer.keybind}
                                onToggle={() => toggleLayer(layer.id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function LayerToggle({
    shortName,
    name,
    enabled,
    loading,
    entityCount,
    color,
    keybind,
    onToggle,
}: {
    id: LayerId;
    shortName: string;
    name: string;
    enabled: boolean;
    loading: boolean;
    entityCount: number;
    color: string;
    keybind: string;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-mono cursor-pointer group transition-colors ${enabled
                    ? "bg-accent-green/5 hover:bg-accent-green/10"
                    : "hover:bg-bg-secondary"
                }`}
        >
            {/* Status indicator */}
            <span
                className={`w-2 h-2 rounded-full shrink-0 ${loading ? "animate-pulse" : ""}`}
                style={{ backgroundColor: enabled ? color : "#333" }}
            />

            {/* Short name */}
            <span
                className={`w-8 font-bold text-[10px] ${enabled ? "text-accent-green" : "text-text-dim group-hover:text-text-secondary"
                    }`}
            >
                {shortName}
            </span>

            {/* Full name */}
            <span
                className={`flex-1 text-left truncate ${enabled ? "text-text-primary" : "text-text-dim group-hover:text-text-secondary"
                    }`}
            >
                {name}
            </span>

            {/* Entity count */}
            {enabled && entityCount > 0 && (
                <span className="text-[9px] text-accent-cyan">
                    {entityCount > 999 ? `${(entityCount / 1000).toFixed(1)}k` : entityCount}
                </span>
            )}

            {/* Keybind */}
            <span className="text-[8px] text-text-dim">{keybind}</span>
        </button>
    );
}
