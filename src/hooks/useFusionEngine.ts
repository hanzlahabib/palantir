import { useEffect, useRef } from "react";
import { runFusionAnalysis, fusionToAlert } from "@/services/fusionEngine";
import { useEntityStore } from "@/stores/entityStore";
import { useAlertStore } from "@/stores/alertStore";

const FUSION_INTERVAL = 30_000; // 30 seconds

/**
 * Periodically runs the data fusion engine against all tracked entities
 * and pushes resulting alerts to the alert store.
 */
export function useFusionEngine() {
    const getTrackedEntities = useEntityStore((s) => s.getTrackedEntities);
    const addAlert = useAlertStore((s) => s.addAlert);
    const seenRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const interval = setInterval(() => {
            const entities = getTrackedEntities();
            if (entities.length === 0) return;

            const events = runFusionAnalysis(entities);

            for (const event of events) {
                // Deduplicate — don't re-alert the same fusion event
                if (seenRef.current.has(event.id)) continue;
                seenRef.current.add(event.id);

                const alert = fusionToAlert(event);
                addAlert(alert);
            }

            // Prune seen set if it gets too large (keep last 500)
            if (seenRef.current.size > 500) {
                const arr = [...seenRef.current];
                seenRef.current = new Set(arr.slice(-250));
            }
        }, FUSION_INTERVAL);

        return () => clearInterval(interval);
    }, [getTrackedEntities, addAlert]);
}
