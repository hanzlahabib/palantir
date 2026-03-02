import { useState } from "react";
import { useCameraStore } from "@/stores/cameraStore";

interface SliderConfig {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
}

const MODE_SLIDERS: Record<string, SliderConfig[]> = {
    crt: [
        { key: "scanlineDensity", label: "SCANLINES", min: 0, max: 2, step: 0.1, defaultValue: 1 },
        { key: "chromaticAberration", label: "CHROMATIC", min: 0, max: 5, step: 0.5, defaultValue: 2 },
        { key: "noiseIntensity", label: "NOISE", min: 0, max: 1, step: 0.05, defaultValue: 0.15 },
        { key: "curvature", label: "CURVATURE", min: 0, max: 1, step: 0.05, defaultValue: 0.3 },
    ],
    nvg: [
        { key: "sensitivity", label: "SENSITIVITY", min: 0.5, max: 2, step: 0.1, defaultValue: 1.2 },
        { key: "gainLevel", label: "GAIN", min: 0, max: 2, step: 0.1, defaultValue: 1 },
        { key: "grainIntensity", label: "GRAIN", min: 0, max: 1, step: 0.05, defaultValue: 0.3 },
    ],
    flir: [
        { key: "sensitivity", label: "SENSITIVITY", min: 0.5, max: 2, step: 0.1, defaultValue: 1 },
        { key: "contrast", label: "CONTRAST", min: 0.5, max: 2, step: 0.1, defaultValue: 1.2 },
    ],
    tactical: [
        { key: "saturation", label: "SATURATION", min: 0, max: 1, step: 0.05, defaultValue: 0.2 },
        { key: "edgeStrength", label: "EDGES", min: 0, max: 2, step: 0.1, defaultValue: 1 },
    ],
};

export default function ShaderControlPanel() {
    const visualMode = useCameraStore((s) => s.visualMode);
    const setVisualMode = useCameraStore((s) => s.setVisualMode);
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState<Record<string, number>>({});
    const [bloomEnabled, setBloomEnabled] = useState(true);
    const [bloomIntensity, setBloomIntensity] = useState(0.5);
    const [sharpenEnabled, setSharpenEnabled] = useState(false);

    const modes = ["standard", "crt", "nvg", "flir", "tactical"] as const;
    const sliders = MODE_SLIDERS[visualMode] || [];

    const getValue = (key: string, defaultValue: number) => values[key] ?? defaultValue;
    const setValue = (key: string, val: number) => setValues((prev) => ({ ...prev, [key]: val }));

    // Expose shader uniforms on window for PostProcessing to read
    const allUniforms = {
        ...Object.fromEntries(sliders.map((s) => [s.key, getValue(s.key, s.defaultValue)])),
        bloomEnabled,
        bloomIntensity,
        sharpenEnabled,
    };
    (window as unknown as Record<string, unknown>).__shaderUniforms = allUniforms;

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="fixed top-10 right-2 z-40 bg-bg-panel/90 border border-border-dim px-2 py-1 font-mono text-[10px] text-text-dim hover:text-accent-cyan hover:border-accent-cyan/30 transition-colors backdrop-blur-sm"
            >
                ◆ SHADERS
            </button>
        );
    }

    return (
        <div className="fixed top-10 right-2 z-40 bg-bg-panel/95 border border-border-dim font-mono text-[10px] backdrop-blur-sm w-[220px] flex flex-col">
            <div className="flex items-center justify-between px-2 py-1 border-b border-border-dim">
                <span className="text-text-secondary tracking-wider">VISUAL MODE</span>
                <button onClick={() => setOpen(false)} className="text-text-dim hover:text-alert-red">✕</button>
            </div>

            {/* Mode selector */}
            <div className="flex flex-wrap gap-1 px-2 py-1 border-b border-border-dim">
                {modes.map((m, i) => (
                    <button
                        key={m}
                        onClick={() => setVisualMode(m)}
                        className={`px-1.5 py-0.5 border uppercase transition-colors ${visualMode === m
                            ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10"
                            : "border-border-dim text-text-dim hover:text-text-secondary"
                        }`}
                    >
                        {i + 1}:{m.slice(0, 3).toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Per-mode sliders */}
            {sliders.length > 0 && (
                <div className="px-2 py-1 border-b border-border-dim space-y-1.5">
                    <div className="text-text-dim mb-1">{visualMode.toUpperCase()} PARAMS</div>
                    {sliders.map((s) => (
                        <div key={s.key} className="flex items-center gap-2">
                            <span className="text-text-dim w-[70px] truncate">{s.label}</span>
                            <input
                                type="range"
                                min={s.min}
                                max={s.max}
                                step={s.step}
                                value={getValue(s.key, s.defaultValue)}
                                onChange={(e) => setValue(s.key, parseFloat(e.target.value))}
                                className="flex-1 h-1 accent-accent-cyan bg-border-dim appearance-none cursor-pointer"
                            />
                            <span className="text-accent-cyan w-[28px] text-right">
                                {getValue(s.key, s.defaultValue).toFixed(1)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Bloom + Sharpen toggles */}
            <div className="px-2 py-1 space-y-1.5">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setBloomEnabled(!bloomEnabled)}
                        className={`px-1.5 py-0.5 border transition-colors ${bloomEnabled
                            ? "border-accent-green text-accent-green bg-accent-green/10"
                            : "border-border-dim text-text-dim"
                        }`}
                    >
                        BLOOM {bloomEnabled ? "ON" : "OFF"}
                    </button>
                    {bloomEnabled && (
                        <input
                            type="range"
                            min={0}
                            max={2}
                            step={0.1}
                            value={bloomIntensity}
                            onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
                            className="flex-1 h-1 accent-accent-green bg-border-dim appearance-none cursor-pointer"
                        />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSharpenEnabled(!sharpenEnabled)}
                        className={`px-1.5 py-0.5 border transition-colors ${sharpenEnabled
                            ? "border-accent-amber text-accent-amber bg-accent-amber/10"
                            : "border-border-dim text-text-dim"
                        }`}
                    >
                        SHARPEN {sharpenEnabled ? "ON" : "OFF"}
                    </button>
                </div>
            </div>

            <div className="px-2 py-1 border-t border-border-dim text-text-dim">
                KEYS: 1-5 switch modes
            </div>
        </div>
    );
}
