import { useState, useEffect } from "react";

const BOOT_LINES = [
    { text: "PALANTIR INTELLIGENCE SYSTEM v1.0.0", delay: 100 },
    { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", delay: 50 },
    { text: "Initializing CesiumJS 3D engine...", delay: 300 },
    { text: "Loading photorealistic tile provider...", delay: 400 },
    { text: "Connecting to backend proxy [0.0.0.0:3001]...", delay: 350 },
    { text: "  ├── Cache layer: ONLINE", delay: 150 },
    { text: "  ├── WebSocket server: ONLINE", delay: 150 },
    { text: "  ├── Rate limiter: ARMED", delay: 150 },
    { text: "  └── Circuit breakers: CLOSED", delay: 150 },
    { text: "Registering data feeds...", delay: 300 },
    { text: "  ├── CelesTrak (satellites): STANDBY", delay: 100 },
    { text: "  ├── OpenSky (aviation): STANDBY", delay: 100 },
    { text: "  ├── airplanes.live (military): STANDBY", delay: 100 },
    { text: "  ├── USGS (seismic): STANDBY", delay: 100 },
    { text: "  ├── GDELT (intelligence): STANDBY", delay: 100 },
    { text: "  └── 23 additional feeds: STANDBY", delay: 100 },
    { text: "Loading tactical HUD overlay...", delay: 250 },
    { text: "Post-processing shader pipeline: READY", delay: 200 },
    { text: "Visual modes: STD / CRT / NVG / FLIR / TAC", delay: 150 },
    { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", delay: 50 },
    { text: "CLASSIFICATION: UNCLASSIFIED // FOUO", delay: 200 },
    { text: "", delay: 100 },
    { text: "▌ PALANTIR OPERATIONAL ▌", delay: 500 },
];

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
    const [visibleLines, setVisibleLines] = useState<string[]>([]);
    const [done, setDone] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        let lineIndex = 0;
        let totalDelay = 0;
        const timeouts: NodeJS.Timeout[] = [];

        for (const line of BOOT_LINES) {
            totalDelay += line.delay;
            const timeout = setTimeout(() => {
                setVisibleLines((prev) => [...prev, line.text]);
                lineIndex++;
            }, totalDelay);
            timeouts.push(timeout);
        }

        // Finish after all lines
        const finishTimeout = setTimeout(() => {
            setDone(true);
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(onComplete, 500);
            }, 1000);
        }, totalDelay + 300);
        timeouts.push(finishTimeout);

        return () => timeouts.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-bg-primary flex items-center justify-center transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"
                }`}
        >
            <div className="w-full max-w-xl p-8 font-mono text-[11px]">
                {visibleLines.map((line, i) => (
                    <div
                        key={i}
                        className={`leading-relaxed ${line.includes("OPERATIONAL")
                                ? "text-accent-green font-bold text-sm mt-2 animate-pulse"
                                : line.includes("ONLINE") || line.includes("READY") || line.includes("ARMED") || line.includes("CLOSED")
                                    ? "text-accent-green"
                                    : line.includes("STANDBY")
                                        ? "text-accent-amber"
                                        : line.startsWith("━")
                                            ? "text-border-subtle"
                                            : line.includes("CLASSIFICATION")
                                                ? "text-alert-amber"
                                                : "text-text-secondary"
                            }`}
                    >
                        {line}
                    </div>
                ))}
                {!done && (
                    <span className="cursor-blink text-accent-green">█</span>
                )}
            </div>
        </div>
    );
}
