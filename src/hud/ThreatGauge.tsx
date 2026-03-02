import { useMemo } from "react";
import { useAlertStore } from "@/stores/alertStore";
import { useLayerStore } from "@/stores/layerStore";

function calculateThreatLevel(alerts: { level: string; timestamp: number }[]): {
  score: number;
  label: string;
  color: string;
} {
  const recentAlerts = alerts.filter((a) => Date.now() - a.timestamp < 3_600_000);
  let score = 0;
  for (const alert of recentAlerts) {
    switch (alert.level) {
      case "critical": score += 25; break;
      case "high": score += 15; break;
      case "medium": score += 5; break;
      case "low": score += 2; break;
      default: score += 1;
    }
  }
  score = Math.min(score, 100);

  if (score >= 75) return { score, label: "CRITICAL", color: "#ff0000" };
  if (score >= 50) return { score, label: "ELEVATED", color: "#ff6600" };
  if (score >= 25) return { score, label: "GUARDED", color: "#ffaa00" };
  if (score > 0) return { score, label: "LOW", color: "#00ff41" };
  return { score: 0, label: "NOMINAL", color: "#00ff41" };
}

export default function ThreatGauge() {
  const alerts = useAlertStore((s) => s.alerts);
  const enabledLayers = useLayerStore((s) => s.getEnabledLayers());
  const threat = useMemo(() => calculateThreatLevel(alerts), [alerts]);

  if (enabledLayers.length === 0) return null;

  return (
    <div className="fixed bottom-9 right-2 z-40 bg-bg-panel/95 border border-border-dim p-2 font-mono text-[10px] min-w-[140px] backdrop-blur-sm">
      <div className="text-text-secondary mb-1 tracking-wider">THREAT LEVEL</div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-bg-primary border border-border-dim overflow-hidden">
          <div
            className="h-full transition-all duration-1000"
            style={{ width: `${threat.score}%`, backgroundColor: threat.color }}
          />
        </div>
        <span className="font-bold" style={{ color: threat.color }}>
          {threat.score}
        </span>
      </div>
      <div className="text-center mt-1 font-bold tracking-widest" style={{ color: threat.color }}>
        {threat.label}
      </div>
    </div>
  );
}
