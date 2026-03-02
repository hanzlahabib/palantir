import { useEffect, useRef } from "react";
import { useEntityStore } from "@/stores/entityStore";
import { useAlertStore } from "@/stores/alertStore";
import { findProximities } from "@/services/proximityEngine";

const PROXIMITY_INTERVAL = 30_000; // 30 seconds

// Proximity rules: layer pair -> threshold km + alert level
const PROXIMITY_RULES: {
    layerA: string;
    layerB: string;
    thresholdKm: number;
    level: "critical" | "high" | "medium";
    title: string;
}[] = [
        {
            layerA: "seismic",
            layerB: "infrastructure",
            thresholdKm: 150,
            level: "critical",
            title: "SEISMIC EVENT NEAR CRITICAL INFRASTRUCTURE",
        },
        {
            layerA: "military",
            layerB: "conflicts",
            thresholdKm: 200,
            level: "high",
            title: "MILITARY AIRCRAFT NEAR CONFLICT ZONE",
        },
        {
            layerA: "fires",
            layerB: "infrastructure",
            thresholdKm: 100,
            level: "high",
            title: "WILDFIRE NEAR CRITICAL INFRASTRUCTURE",
        },
        {
            layerA: "maritime",
            layerB: "conflicts",
            thresholdKm: 150,
            level: "medium",
            title: "VESSEL NEAR CONFLICT ZONE",
        },
    ];

/**
 * Periodically checks spatial proximity between entities from different layers
 * and fires alerts when configured thresholds are crossed.
 */
export function useProximityAlerts() {
    const getTrackedEntities = useEntityStore((s) => s.getTrackedEntities);
    const addAlert = useAlertStore((s) => s.addAlert);
    const seenRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const interval = setInterval(() => {
            const entities = getTrackedEntities();
            if (entities.length < 2) return;

            for (const rule of PROXIMITY_RULES) {
                const layerAEntities = entities.filter((e) => e.layerId === rule.layerA);
                const layerBEntities = entities.filter((e) => e.layerId === rule.layerB);

                if (layerAEntities.length === 0 || layerBEntities.length === 0) continue;

                // Check proximity between the two layer sets
                const combined = [...layerAEntities, ...layerBEntities];
                const matches = findProximities(combined, rule.thresholdKm, true);

                for (const match of matches) {
                    // Only alert for cross-layer matches that match the rule
                    const isCorrectPair =
                        (match.entityA.layerId === rule.layerA && match.entityB.layerId === rule.layerB) ||
                        (match.entityA.layerId === rule.layerB && match.entityB.layerId === rule.layerA);

                    if (!isCorrectPair) continue;

                    const alertId = `prox-${match.entityA.id}-${match.entityB.id}`;
                    if (seenRef.current.has(alertId)) continue;
                    seenRef.current.add(alertId);

                    addAlert({
                        id: alertId,
                        timestamp: Date.now(),
                        level: rule.level,
                        title: rule.title,
                        description: `${match.distanceKm.toFixed(0)}km apart`,
                        source: rule.layerA as any,
                        lat: match.entityA.lat,
                        lon: match.entityA.lon,
                    });
                }
            }

            // Prune seen set
            if (seenRef.current.size > 300) {
                const arr = [...seenRef.current];
                seenRef.current = new Set(arr.slice(-150));
            }
        }, PROXIMITY_INTERVAL);

        return () => clearInterval(interval);
    }, [getTrackedEntities, addAlert]);
}
