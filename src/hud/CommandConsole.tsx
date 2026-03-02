import { useState, useRef, useEffect, useCallback } from "react";
import { useCameraStore } from "@/stores/cameraStore";
import { useLayerStore } from "@/stores/layerStore";
import type { VisualMode } from "@/types/globe";


interface CommandResult {
    text: string;
    type: "success" | "error" | "info";
}

const COMMAND_HISTORY_MAX = 50;

export default function CommandConsole() {
    const [visible, setVisible] = useState(false);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [output, setOutput] = useState<CommandResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const setVisualMode = useCameraStore((s) => s.setVisualMode);
    const setDetectionDensity = useCameraStore((s) => s.setDetectionDensity);
    const toggleLayer = useLayerStore((s) => s.toggleLayer);
    const layers = useLayerStore((s) => s.layers);

    // Keyboard shortcut to toggle console
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "/" || e.key === "`") {
                // Don't trigger if typing in another input
                if (document.activeElement?.tagName === "INPUT") return;
                e.preventDefault();
                setVisible((v) => !v);
            }
            if (e.key === "Escape" && visible) {
                setVisible(false);
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [visible]);

    // Focus input when visible
    useEffect(() => {
        if (visible) inputRef.current?.focus();
    }, [visible]);

    const executeCommand = useCallback((cmd: string) => {
        const parts = cmd.trim().toLowerCase().split(/\s+/);
        const command = parts[0];
        const args = parts.slice(1);

        let result: CommandResult;

        switch (command) {
            case "mode": {
                const modes: VisualMode[] = ["standard", "crt", "nvg", "flir", "tactical"];
                const mode = args[0] as VisualMode;
                if (modes.includes(mode)) {
                    setVisualMode(mode);
                    result = { text: `Visual mode: ${mode.toUpperCase()}`, type: "success" };
                } else {
                    result = { text: `Unknown mode. Available: ${modes.join(", ")}`, type: "error" };
                }
                break;
            }

            case "layer": {
                const layerName = args[0];
                const action = args[1]; // on/off
                const layer = layers.find(
                    (l) => l.id === layerName || l.shortName.toLowerCase() === layerName
                );
                if (layer) {
                    if ((action === "on" && !layer.enabled) || (action === "off" && layer.enabled)) {
                        toggleLayer(layer.id);
                    }
                    result = { text: `Layer ${layer.shortName}: ${action?.toUpperCase() || "TOGGLED"}`, type: "success" };
                } else {
                    const available = layers.map((l) => l.id).join(", ");
                    result = { text: `Unknown layer. Available: ${available}`, type: "error" };
                }
                break;
            }

            case "density": {
                const density = args[0] as "sparse" | "dense";
                if (density === "sparse" || density === "dense") {
                    setDetectionDensity(density);
                    result = { text: `Detection density: ${density.toUpperCase()}`, type: "success" };
                } else {
                    result = { text: "Usage: density <sparse|dense>", type: "error" };
                }
                break;
            }

            case "help":
                result = {
                    text: [
                        "Commands:",
                        "  mode <standard|crt|nvg|flir|tactical>",
                        "  layer <name> <on|off>",
                        "  density <sparse|dense>",
                        "  clear — clear output",
                        "  status — system status",
                        "  help — show this help",
                    ].join("\n"),
                    type: "info",
                };
                break;

            case "status": {
                const enabled = layers.filter((l) => l.enabled);
                const total = layers.reduce((s, l) => s + l.entityCount, 0);
                result = {
                    text: `Feeds: ${enabled.length}/${layers.length} ONLINE | Entities: ${total}`,
                    type: "info",
                };
                break;
            }

            case "clear":
                setOutput([]);
                return;

            default:
                result = { text: `Unknown command: ${command}. Type 'help' for commands.`, type: "error" };
        }

        setOutput((prev) => [...prev.slice(-20), result]);
    }, [layers, setVisualMode, setDetectionDensity, toggleLayer]);

    const handleSubmit = () => {
        if (!input.trim()) return;
        setHistory((prev) => [input, ...prev].slice(0, COMMAND_HISTORY_MAX));
        setHistoryIndex(-1);
        executeCommand(input);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmit();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                const idx = historyIndex + 1;
                setHistoryIndex(idx);
                setInput(history[idx]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex > 0) {
                const idx = historyIndex - 1;
                setHistoryIndex(idx);
                setInput(history[idx]);
            } else {
                setHistoryIndex(-1);
                setInput("");
            }
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-13 left-0 right-0 z-50 bg-bg-primary/95 border-t border-accent-green/30 backdrop-blur-sm font-mono">
            {/* Output */}
            {output.length > 0 && (
                <div className="max-h-40 overflow-y-auto px-4 py-2 text-[11px] space-y-1">
                    {output.map((line, i) => (
                        <div
                            key={i}
                            className={`whitespace-pre-wrap ${line.type === "error"
                                ? "text-alert-red"
                                : line.type === "success"
                                    ? "text-accent-green"
                                    : "text-text-secondary"
                                }`}
                        >
                            {line.text}
                        </div>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="flex items-center px-4 h-8 border-t border-border-dim">
                <span className="text-accent-green text-xs mr-2">▸</span>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-text-primary text-xs outline-none caret-accent-green placeholder:text-text-dim"
                    placeholder="Type command... (help for list)"
                    spellCheck={false}
                    autoComplete="off"
                />
                <span className="cursor-blink text-accent-green text-xs">█</span>
            </div>
        </div>
    );
}
