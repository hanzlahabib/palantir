import { useAlertStore } from "@/stores/alertStore";
import { useEffect, useRef } from "react";

export default function AlertFeed() {
    const alerts = useAlertStore((s) => s.alerts);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el || alerts.length === 0) return;

        // Auto-scroll animation
        let animationId: number;
        let position = el.scrollWidth;

        const scroll = () => {
            position -= 0.5;
            if (position < -el.scrollWidth) position = el.clientWidth;
            el.scrollLeft = position;
            animationId = requestAnimationFrame(scroll);
        };

        animationId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationId);
    }, [alerts]);

    if (alerts.length === 0) {
        return (
            <div className="fixed bottom-7 left-0 right-0 z-40 h-6 bg-bg-primary/80 border-t border-border-dim flex items-center px-4 font-mono text-[10px] text-text-dim">
                <span className="text-accent-green mr-2">▸▸▸</span>
                PALANTIR — ALL SYSTEMS NOMINAL — NO ACTIVE ALERTS
                <span className="text-accent-green ml-2">◂◂◂</span>
            </div>
        );
    }

    const levelColors: Record<string, string> = {
        critical: "text-alert-red",
        high: "text-alert-amber",
        medium: "text-accent-amber",
        low: "text-accent-green",
        info: "text-accent-cyan",
    };

    return (
        <div className="fixed bottom-7 left-0 right-0 z-40 h-6 bg-bg-primary/80 border-t border-border-dim overflow-hidden">
            <div
                ref={scrollRef}
                className="flex items-center h-full whitespace-nowrap font-mono text-[10px] gap-8 px-4"
            >
                {alerts.slice(0, 20).map((alert) => (
                    <span key={alert.id} className="flex items-center gap-1.5 shrink-0">
                        <span className={`font-bold ${levelColors[alert.level] || "text-text-dim"}`}>
                            [{alert.level.toUpperCase()}]
                        </span>
                        <span className="text-text-primary">{alert.title}</span>
                        <span className="text-text-dim">
                            {new Date(alert.timestamp).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            })}
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}
